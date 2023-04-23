'use strict';

// const { assert } = require('console');
const express = require('express');
const fs = require('fs');
const moment = require('moment');
const assert = require('assert');
const { fn } = require('moment');
// const { PassThrough } = require('stream');
const { sort } = require('mathjs');
const uuid = require('uuid');
const { AsyncResource } = require('async_hooks');
const {MongoClient, ObjectId} = require('mongodb');
const {exit} = require('process');
const bodyParser = require('body-parser');
const util = require('util');
// const methodOverride = require('method-override');
const {graphqlHTTP} = require('express-graphql');
const { buildSchema } = require('graphql');



const PORT = 3000;
const MONGO_DATA_PATH = `./config/mongo.json`;
const API_PATH = '/api';

const app = express();

// app.use(methodOverride('_method')); // override the method if there is a input field '_method'




class Player {
    constructor(fname, lname, handed, balance_usd_cents) {
        this.fname = fname; this.lname = lname; this.handed = handed;
        this.balance_usd_cents = balance_usd_cents;

        this.created_at = new Date(); this.is_active = true; 
        this.num_join = 0; this.num_won = 0; this.num_dq = 0;
        this.total_points = 0; this.total_prize_usd_cents = 0;
        this.efficiency = 0; this.in_active_match = null;
    }
}

class Match {
    constructor(p1_id, p2_id, entry_fee_usd_cents, prize_usd_cents) {
        this.entry_fee_usd_cents = entry_fee_usd_cents;
        this.p1_id = p1_id; this.p2_id = p2_id;
        this.prize_usd_cents = prize_usd_cents; 

        this.p1_name = null; // names are filled in the function createMatch()
        this.p2_name = null;
        this.p1_points = 0; this.p2_points = 0;
        this.winner_pid = null; this.is_active = true; this.is_dq = false;
        this.age = 0;
        this.created_at = new Date(); this.ended_at = null; 
    }
}

class MongoDB {
    constructor(){
        this.MongoDb = null;
        this.players = null;
        this.matches = null;
        this.ObjectId = require('mongodb').ObjectId;

        this.id = 0;
        this.my_error = new Error('information error!');
        this.error_2 = new Error('does not exist!');
        this.match_error_1 = new Error('p1 or p2 does not exist!');
        this.match_error_2 = new Error('player1 or player2 already in an active match!');
        this.match_error_3 = new Error('insufficient account balance!');
        this.match_error_4 = new Error('match not active!');
        this.match_error_5 = new Error('points tied!');
        this.match_error_6 = new Error('player is not in match!');

    
        this.connect_mongo().catch((err) => {
            console.dir(err);
            exit(5);
        });
    }
    
    read_json(){
      try{
        let data = fs.readFileSync(MONGO_DATA_PATH);
        let json_file = JSON.parse(data);
        // json_file = MONGO_HOST;
        return json_file;
      } catch(err){
        // throw err;
        // console.dir(err);
        exit(2);
      }
      
    }
  
    async connect_mongo(){
        this.read_json();
        // const uri = `mongodb://${mongo_json.host}:${mongo_json.port}`;
        const uri = `mongodb://localhost:27017`;

        // const MONGO_DB = `${mongo_json.db}`;
        // console.log(`Time til connect: ${new Date()-StartAt}`);

        const client = new MongoClient(uri, {useUnifiedTopology: true});
        await client.connect();
        console.log("client connected successfully! ");


        this.MongoDb = client.db("ee547_hw");
        this.coll = this.MongoDb.collection('player');
        this.coll_m = this.MongoDb.collection('match');
        this.players = await this.coll.find({}).toArray();
        this.matches = await this.coll_m.find({}).toArray();
        app.listen(PORT);
        console.log(`Server started, port ${PORT}`);
    }

    async create() {
        if (!fs.existsSync(MONGO_DATA_PATH)) {
            const obj = {
                host: "localhost", 
                port: "27017", 
                db: "ee547_hw", 
                opts: {
                    useUnifiedTopology: true
                }
            };
            const json_file = JSON.stringify(obj);
            fs.writeFileSync(MONGO_DATA_PATH, json_file);
            this.players = [];
            this.matches = [];
            // this.id = 0;
        } else {
            // this.content = JSON.parse(fs.readFileSync(this.path));
            this.players = await this.MongoDb.collection('player').find({}).toArray();
            this.matches = await this.MongoDb.collection('match').find({}).toArray();
            // for (let ply of this.players) {
            //     this.id = Math.max(this.id, Number(ply._id.toString()));
            // }
        }
     
    }

    checkValid(attribute, value) {
        switch (attribute) {
            // case 'pid':
            //     if (!(Number.isInteger(value)))
            //         throw this.my_error;
            //     return value;
            
            case 'fname':
                if (value === undefined) return 'John';
                if (value === '') throw this.my_error;
                if (!(typeof value === 'string') || !(value.match(/^[A-Za-z]+$/)))
                    throw this.my_error;
                return value;

            case 'lname':
                if (value === null || value === undefined)
                    return 'Bush';
                if (!(typeof value === 'string') || !(value.match(/^[A-Za-z]*$/)))
                    throw this.my_error;
                return value;

            case 'handed':
                if (value === undefined) return 'R';
                if (!(typeof value === 'string'))
                    throw this.my_error
                value = value.toLowerCase();
                if (!(value === 'left' || value === 'right' || value === 'ambi' || value === 'l' || value === 'r' || value === 'ambi'))
                    throw this.my_error;
                if (value === 'left' || value === 'l')
                    return 'L';
                else if (value === 'right' || value === 'r')
                    return 'R';
                else
                    return 'Ambi';

            case 'is_active':
                if (value === undefined || value === null)
                    throw this.my_error;
                else if (typeof value === 'string') {
                    const s = value.toLowerCase();
                    if (s === 't' || s === 'true' || s === '1') {
                        return true;
                    } else if (s === 'f' || s === 'false' || s === '0') 
                        return false;
                    else throw this.my_error;
                } else {
                    if (value === true || value === 1) {
                        return true;
                    } else if (value === false || value === 0) {
                        return false;
                    } else throw this.my_error;
                }

            case 'balance_usd_cents':
                if (value === undefined) return 0;
                if (this.checkCurrency(value)) {
                    return Number(value);
                }
                else
                    throw this.my_error;
            
            case "num_join":
                if (this.checkCurrency(value)) {
                    return Number(value);
                }
                else
                    throw this.my_error;

            case "num_won":
                if (this.checkCurrency(value)) {
                    return Number(value);
                }
                else
                    throw this.my_error;

            case "num_dq":
                if (this.checkCurrency(value)) {
                    return Number(value);
                }
                else
                    throw this.my_error;

            case "total_points":
                if (this.checkCurrency(value)) {
                    return Number(value);
                }
                else
                    throw this.my_error;

            case "total_prize_usd_cents":
                if (this.checkCurrency(value)) {
                    return Number(value);
                }
                else
                    throw this.my_error;

            case "efficiency":
                if (this.checkEfficiency(value)) {
                    return Number(value);
                }
                else
                    throw this.my_error;
            
            case "in_active_match":
                if (value === null)
                    return value;
                else if (value === "null")
                    return null;
                else if (typeof value === "string" && value.length === 24)
                    return value;
                else throw this.my_error;
        
            default:
                throw this.my_error;
        }
    }

    checkValid_v2(fn, ln, hand, balance) {
        let invalid_fields = "";

        // if (!Number.isInteger(pid))
        //     invalid_fields += " ,pid";
        if (fn != undefined) {
            if (!(typeof fn === 'string') || !(fn.match(/^[A-Za-z]+$/)))
                invalid_fields += ", fname";
        }

        let flag = false;
        if (ln === undefined) flag = true;
        else {
            if (ln.match(/^[A-Za-z]*$/)) flag = true;
        }
        if (!flag) invalid_fields += ", lname";

        flag = false;
        // console.log(hand);
        if (typeof hand === 'string' && hand.match(/^[A-Za-z]+$/)) {
            if (hand === undefined || (hand.toLowerCase() === 'left' || hand.toLowerCase() === 'right' || hand.toLowerCase() === 'ambi'))
            flag = true;
        } 
        if (!flag) invalid_fields += ", handed";        

        if (balance != undefined) {
            flag = this.checkCurrency(balance);
            if (!flag) invalid_fields += ", initial_balance_usd_cents";    
        }

        // console.log(invalid_fields);

        invalid_fields = invalid_fields.slice(2);
        // console.log(invalid_fields);
        return invalid_fields;


    }

    checkCurrency(value) {
        // console.log('value = ', value);
        if (!(typeof value === 'number' || typeof value === 'string')) {
            // console.log(1);
            return false;
        }
        const num = Number(value);
        if (Number.isNaN(num)) {
            // console.log(2);
            return false;    
        }
        if (num < 0) {
            // console.log(3);
            return false;    
        }
        let decimal_places = 0;
        if (!Number.isInteger(num)) {
            // console.log(4);
            // decimal_places = num.toString().split('.')[1].length;
            return false;
        }
        // if (decimal_places > 2) {
        //     // console.log(5);
        //     return false;
        // }
        return true;

    }

    checkEfficiency(value) {
        if (!(typeof value === 'number' || typeof value === 'string')) {
            return false;
        }
        const num = Number(value);
        if (Number.isNaN(num)) {
            return false;    
        }
        if (num < 0 || num > 1) {
            return false;    
        }
        return true;

    }

    checkPoints(value) {
        if (!(typeof value === 'number' || typeof value === 'string')) {
            return false;
        }
        if (value === '1.0') return false;
        const num = Number(value);
        if (Number.isNaN(num)) {
            return false;    
        }
        if (num <= 0) {
            return false;    
        }
        if (!Number.isInteger(num)) {
            return false;
        }
        return true;

    }


    transformatPlayer(ply) {
        let name_new = "";
        if (ply["lname"] === "" || ply["lname"] === null)
            name_new = ply["fname"];
        else
            name_new = ply["fname"] + ' ' + ply["lname"];

        let handed_new = "";
        if (ply["handed"] === 'L') 
            handed_new = "left";
        else if (ply["handed"] === 'R')
            handed_new = 'right';
        else 
            handed_new = "ambi";

        let i_a_m = ply.in_active_match;
        if (i_a_m === undefined) i_a_m = null;
        
        const ply_new = {
            pid: ply._id.toString(),
            name: name_new,
            handed: handed_new,
            is_active: ply["is_active"],
            num_join: ply.num_join || 0,
            num_won: ply.num_won || 0,
            num_dq: ply.num_dq || 0,
            balance_usd_cents: ply["balance_usd_cents"],
            total_points: ply.total_points || 0,
            total_prize_usd_cents: ply.total_prize_usd_cents || 0,
            efficiency: ply.efficiency || 0,
            in_active_match: i_a_m
        };

        return ply_new;
    }

    async getPlayer(pid) {
        await this.create();

        // console.log(pid);

        if (this.players.length === 0)
            throw this.my_error;
        // console.log(1);

        const ply = await this.get_value(pid);

        // console.log(2)
        // console.log('ply = ', ply);

        if (ply) return this.transformatPlayer(ply);
        else throw this.error_2;

        // if (this.players.length === 0)
        //     throw this.my_error;
        // let plys = this.players;
        // for (let ply of plys) {
        //     // console.log("current ply: ", plys[i]["pid"]);
        //     if (ply._id.toString() === pid.toString())
        //         return this.transformatPlayer(ply);
        // }
        // throw this.error_2;
    }

    async getPlayer_original(pid) {
        // used for addCurrency() only

        await this.create();

        if (this.players.length === 0)
            throw this.my_error;
        
        const ply = await this.get_value(pid);
        if (ply) return ply;
        else throw this.error_2;

        // if (this.players.length === 0)
        //     throw this.my_error;
        // let plys = this.players;
        // for (let ply of plys) {
        //     if (ply._id.toString() === pid.toString())
        //         return ply;
        // }
        // throw this.error_2;
    }


    async createPlayer(fname, lname, handed, balance_usd_cents) {
        // console.log(2);
        await this.create();

        // console.log(3);

        // this.id++;
        // const id_current = this.id;

        const new_player = new Player(
            // id_current,
            this.checkValid('fname', fname),
            this.checkValid('lname', lname),
            this.checkValid('handed', handed), 
            // this.checkValid('is_active', is_active),
            this.checkValid('balance_usd_cents', balance_usd_cents)
        );

        // console.log(4);

        const res = await this.insert_value(new_player);

        return res.insertedId.toString();

        // console.log(5);

        // this.content.players.push(new_player);
        // setTimeout(this.update, 200);
        // this.update();
        // return id_current;
    }

    async updatePlayer(pid, attribute, value) {
        await this.create();

        // console.log(pid);
        await this.getPlayer(pid);
        const valid_value = this.checkValid(attribute, value);
        
        const update_obj = {};
        update_obj[attribute] = valid_value;
        
        const res = await this.update_values(pid, update_obj);
        if (res) return;
        else throw new Error("updating failed");

        // const valid_value = this.checkValid(attribute, value);
        // for (let i=0; i<this.content.players.length; i+=1) {
        //     if (this.content.players[i]["pid"] == pid) {
        //         this.content.players[i][attribute] = valid_value;
        //         break;
        //     }
        // }
        // this.update();

    }

    async deletePlayer(pid) {
        await this.create();

        await this.getPlayer(pid);

        await this.delete_value(pid);



        // for (let i=0; i<this.content.players.length; i+=1) {
        //     if (this.content.players[i]["pid"] == pid) {
        //         this.content.players.splice(i,1);
        //         break;
        //     }
        // }
        // this.update();
    }

    async getBalance(pid) {
        await this.create();

        const ply = await this.getPlayer_original(pid);

        return Number(ply.balance_usd_cents);


        // for (let i=0; i<this.players.length; i+=1) {
        //     if (this.content.players[i]["pid"] == pid) {
        //         return this.content.players[i]["balance_usd"];
        //     }
        // }
       
    }

    async getPlayers(flag = null) {
        await this.create();

        if (this.players === []) {
            return [];
        }

        let filter = null;
        if (flag === null)
            filter = {};
        else filter = {is_active: flag};

        let plys = await this.get_values(filter);
        let plys_tosort = [];
        // console.log(this.content.players.length);

        for (let i=0; i<plys.length; i+=1) {
            // console.log(this.content.players[i].fname);
            plys_tosort.push(this.transformatPlayer(plys[i]));
        }

        plys_tosort.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        return plys_tosort;

    }

    async addCurrency(pid, value) {
        await this.create();

        await this.getPlayer(pid);
        // if (this.getPlayer(pid) === -1) {
        //     throw this.my_error;
        // }

        let currency_current = Number(await this.getBalance(pid));
        await this.updatePlayer(pid, 'balance_usd_cents', currency_current + Number(value));

        // console.log("currency_current: ", currency_current, typeof currency_current);

        let playerBalance = {
            old_balance_usd_cents: currency_current,
            new_balance_usd_cents: (currency_current + Number(value))
        };

        // this.update();
        return playerBalance;
    }

    async avg_balance() {
        await this.create();

        if (this.players === []) {
            return 0;
        }

        let balance_count = 0;
        let plys = this.getPlayers();
        for (let i=0; i<plys.length; i+=1) {
            balance_count += plys[i].balance_usd_cents;
        }

        // console.log(balance_count);
        let avg_balance = balance_count / plys.length;

        // return Number(balance_count / this.players.length).toFixed(2);
        // return 0;
        return avg_balance;
    }

    async searchPlayers(q = null) {
        await this.create();

        if (this.players === []) {
            return [];
        }

        let plys = await this.getPlayers();
        let plys_valid = [];
        const str_key = decodeURIComponent(q.split(';')[0]).toLowerCase();
        // const reg = '/'+ q +'/';

        for (const ply of plys) {
            const name = ply["name"].toLowerCase();
            if (name.includes(str_key)) {
                plys_valid.push(ply);
            }
        }
        return plys_valid;

    }





    async checkValidMatch(p1_id, p2_id, entry_fee_usd_cents, prize_usd_cents) {
        if (p1_id && p2_id && entry_fee_usd_cents && prize_usd_cents === undefined)
            throw this.my_error;
        
        if (!(this.checkCurrency(entry_fee_usd_cents) && this.checkCurrency(prize_usd_cents)))
            throw this.my_error;

        const real_entry = Number(entry_fee_usd_cents);
        const real_prize = Number(prize_usd_cents);

        const ply_1 = await this.getPlayer(p1_id);
        const ply_2 = await this.getPlayer(p2_id);

        if (ply_1.in_active_match || ply_2.in_active_match)
            throw this.match_error_2;
        
        if (Number(ply_1.balance_usd_cents) < real_entry || Number(ply_2.balance_usd_cents) < real_entry)
            throw this.match_error_3;
        
        return true;
    }


    async getMatches(flag = null) {
        await this.create();

        if (this.matches === []) {
            return [];
        }

        let filter = null;
        if (flag === null || flag === true)
            filter = { $or: [ { ended_at: null }, { ended_at: { $exists: false } } ] };
        else if (flag === '*')
            filter = {};
        else 
            filter = { ended_at: { $exists: true, $type: "date" } };

        let mchs = await this.m_get_values(filter);
        let mchs_tosort = [];
        // console.log(this.content.players.length);

        for (let i=0; i<mchs.length; i+=1) {
            // console.log(this.content.players[i].fname);
            mchs_tosort.push(await this.transformatMatch(mchs[i]));
        }

        mchs_tosort.sort((a, b) => {
            return b.prize_usd_cents - a.prize_usd_cents;
        });

        return mchs_tosort;

    }

    async getMatch(mid) {
        await this.create();


        if (this.matches.length === 0)
            throw this.my_error;

        const mch = await this.m_get_value(mid);

        if (mch) return await this.transformatMatch(mch);
        else throw this.error_2;

    }

    async transformatMatch(mch) {
        const ply_1 = await this.getPlayer(mch.p1_id.toString());
        const ply_2 = await this.getPlayer(mch.p2_id.toString());

        let active_state = null;
        if (mch.is_active === false) active_state = false;
        else active_state = true;

        const mch_new = {
            mid: mch._id.toString(),
            entry_fee_usd_cents: mch.entry_fee_usd_cents || 10,
            p1_id: mch.p1_id.toString(),
            p1_name: ply_1.name,
            p1_points: mch.p1_points || 0,
            p2_id: mch.p2_id.toString(),
            p2_name: ply_2.name,
            p2_points: mch.p2_points || 0,
            winner_pid: mch.winner_pid || null,
            is_dq: mch.is_dq || false,
            is_active: active_state,
            prize_usd_cents: mch.prize_usd_cents || 0,
            age: mch.age || 0,
            created_at: mch.created_at || new Date(), 
            ended_at: mch.ended_at || null
        };
        return mch_new;
    }


    async createMatch(p1_id, p2_id, entry_fee_usd_cents, prize_usd_cents) {
        await this.create();


        await this.checkValidMatch(p1_id, p2_id, entry_fee_usd_cents, prize_usd_cents);

        const new_match = new Match(this.ObjectId(p1_id.toString()), this.ObjectId(p2_id.toString()), Number(entry_fee_usd_cents), Number(prize_usd_cents));
        new_match.p1_name = (await this.getPlayer(p1_id)).name
        new_match.p2_name = (await this.getPlayer(p2_id)).name;

        // deduct the balance of the players, and change their status
        const p1_balance = await this.getBalance(p1_id); const p2_balance = await this.getBalance(p2_id);
        await this.updatePlayer(p1_id, "balance_usd_cents", p1_balance-Number(entry_fee_usd_cents));
        await this.updatePlayer(p2_id, "balance_usd_cents", p2_balance-Number(entry_fee_usd_cents));
        const p1_num_join = (await this.getPlayer(p1_id)).num_join;
        const p2_num_join = (await this.getPlayer(p2_id)).num_join;
        await this.updatePlayer(p1_id, "num_join", Number(p1_num_join)+1);
        await this.updatePlayer(p2_id, "num_join", Number(p2_num_join)+1);
        // await this.updatePlayer(p1_id, "is_active", true); await this.updatePlayer(p2_id, "is_active", true);

        const res = await this.m_insert_value(new_match);
        const mid = res.insertedId.toString();

        await this.updatePlayer(p1_id, "in_active_match", mid);
        await this.updatePlayer(p2_id, "in_active_match", mid);

        return mid;
    }

    async updateMatchPoints(mid, pid, points) {
        await this.create();

        const ply = await this.getPlayer(pid);
        const mch = await this.getMatch(mid);

        if (mch.is_active === false)
            throw this.match_error_4;

        let valid_points = null;
        if (this.checkPoints(points))
            valid_points = Number(points);
        else throw this.my_error;
        
        let update_obj = {};
        const current_time = new Date();
        update_obj["age"] = Math.round((current_time.getTime() - mch.created_at.getTime())/1000);
        if (mch.p1_id === pid)
            update_obj["p1_points"] = Number(mch.p1_points) + valid_points;
        else if (mch.p2_id === pid)
            update_obj["p2_points"] = Number(mch.p2_points) + valid_points;
        else
            throw this.error_6;
        

        // update players data
        const ply_total_points = ply.total_points;
        await this.updatePlayer(pid, "total_points", Number(ply_total_points) + valid_points);

        const res = await this.m_update_values(mid, update_obj);
        if (res) return;
        else throw new Error("updating failed");


    }

    async endMatch(mid, disqualifier = null) {
        await this.create();

        const mch = await this.getMatch(mid);
        if (mch.is_active === false)
            throw this.match_error_4;
        if (disqualifier === null && mch.p1_points === mch.p2_points) 
            throw this.match_error_5;
        
        let winner_id = null;
        let ply_win = null; let ply_lose = null;
        if (disqualifier === mch.p1_id) winner_id = mch.p2_id;
        else if (disqualifier === mch.p2_id) winner_id = mch.p1_id;
        else {
            if (mch.p1_points > mch.p2_points) winner_id = mch.p1_id;
            else winner_id = mch.p2_id;
        }

        if (winner_id === mch.p1_id) {
            ply_win = await this.getPlayer(mch.p1_id);
            ply_lose = await this.getPlayer(mch.p2_id);
        } else {
            ply_win = await this.getPlayer(mch.p2_id);
            ply_lose = await this.getPlayer(mch.p1_id);
        }

        let update_obj = {};
        update_obj["winner_pid"] = winner_id;
        // update_obj["is_dq"] = false;
        update_obj["is_active"] = false;
        const current_time = new Date();
        update_obj["age"] = Math.round((current_time.getTime() - mch.created_at.getTime())/1000);
        update_obj["ended_at"] = moment().toISOString();
        

        // update players data
        await this.updatePlayer(winner_id, "num_won", Number(ply_win.num_won) + 1);
        await this.updatePlayer(winner_id, "balance_usd_cents", Number(ply_win.balance_usd_cents) + Number(mch.prize_usd_cents));
        await this.updatePlayer(winner_id, "total_prize_usd_cents", Number(ply_win.total_prize_usd_cents) + Number(mch.prize_usd_cents));
        let winner_eff = (Number(ply_win.num_won)+1) / Number(ply_win.num_join || 1); //attention: here we should +1
        let loser_eff = Number(ply_lose.num_won) / Number(ply_lose.num_join || 1);
        await this.updatePlayer(winner_id, "efficiency", winner_eff);
        await this.updatePlayer(ply_lose.pid, "efficiency", loser_eff);
        await this.updatePlayer(winner_id, "in_active_match", null);
        await this.updatePlayer(ply_lose.pid, "in_active_match", null);

        const res = await this.m_update_values(mid, update_obj);
        if (res) return;
        else throw new Error("match ending failed");

    }

    async disqualifyMatch(mid, pid) {
        await this.create();

        const mch = await this.getMatch(mid);
        const ply = await this.getPlayer(pid);

        if (mch.p1_id != pid && mch.p2_id != pid)
            throw this.match_error_6;

        await this.endMatch(mid, pid);

        let update_obj = {};
        update_obj["is_dq"] = true;        

        // update player info
        await this.updatePlayer(pid, "num_dq", Number(ply.num_dq)+1);
        
        const res = await this.m_update_values(mid, update_obj);        
        if (res) return;
        else throw new Error("match disqualifying failed");

    }

    




    async update_values(id, values){
      try {
        let set_values = {$set:values};
        let key_value = {_id:this.ObjectId(id.toString())};
        let update_obj = {key_value, set_values};
        
        let response = await this.coll.updateOne(update_obj.key_value, update_obj.set_values);
        // console.log('abc');
        if(response.matchedCount == 0){
            console.log(`Error updating player ID:${id}`);
            return false;
        }
        else{
            return true;
        }
      } catch (err) {
        // console.dir(err);
      }
    }
  
    async m_update_values(id, values){
        try {
          let set_values = {$set:values};
          let key_value = {_id:this.ObjectId(id.toString())};
          let update_obj = {key_value, set_values};
          
          let response = await this.coll_m.updateOne(update_obj.key_value, update_obj.set_values);
          if(response.matchedCount == 0){
              console.log(`Error updating match ID:${id}`);
              return false;
          }
          else{
              return true;
          }
        } catch (err) {
          // console.dir(err);
        }
    }

    async insert_value(value){
        try{
            return await this.coll.insertOne(value);
        } catch(err){
            // console.dir(err);
        }
    }

    async m_insert_value(value){
        try{
            return await this.coll_m.insertOne(value);
        } catch(err){
            // console.dir(err);
        }
    }

    async delete_value(id){
        try {
            let key_value = {_id:this.ObjectId(id.toString())};
            return await this.coll.deleteOne(key_value);
        } catch (err) {
            // console.log(err);
            // next(err);
        }
    }

    async m_delete_value(id){
        try {
            let key_value = {_id:this.ObjectId(id.toString())};
            return await this.coll_m.deleteOne(key_value);
        } catch (err) {
            // console.log(err);
            // next(err);
        }
    }

    async get_value(id){
        try {
            if(id.length != 24){
                console.err("length is not 24!");
                throw this.my_error;
            }
            // console.log(id);
            let key_value = {_id:this.ObjectId(id.toString())};
            return await this.coll.findOne(key_value);
        } catch (err) {
            // console.dir(err);
        }
    }

    async m_get_value(id){
        try {
            if(id.length != 24){
                console.err("length is not 24!");
                throw this.my_error;
            }
            // console.log(id);
            let key_value = {_id:this.ObjectId(id.toString())};
            return await this.coll_m.findOne(key_value);
        } catch (err) {
            // console.dir(err);
        }
    }

    async get_values(search_value = null){
        try {
            if(search_value == null) return await this.coll.find({}).toArray();
            else return await this.coll.find(search_value).toArray();
        } catch (err) {
            // console.dir(err);
            // next(err);
        }
    }

    async m_get_values(search_value = null){
        try {
            // if(search_value == null) return await this.coll_m.find({}).toArray();
            // else return await this.coll_m.find(search_value).toArray();
            return await this.coll_m.find(search_value).toArray();
        } catch (err) {
            // console.dir(err);
            // next(err);
        }
    }

}
  
const mongo = new MongoDB();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(express.static('public'));

// app.use(bodyParser.urlencoded({ extended: true })); // parse url-encoded
app.use(bodyParser.json()); // parse json
// app.use(methodOverride('_method')); // override the method if there is a input field '_method'

const schema = buildSchema(`
type Query {
    player(pid: ID!): Player

    players(
        limit: Int # you may skip this field
        offset: Int # you may skip this field
        sort: String # you may skip this field
        is_active: WildcardBoolean
        q: String
    ): [Player]!

    match(mid: ID!): Match

    matches(
        limit: Int # you may skip this field
        offset: Int # you may skip this field
        sort: String # you may skip this field
        is_active: WildcardBoolean
    ): [Match]!

    dashboard: Dashboard

}

type Mutation {
    matchAward(
        mid: ID!
        pid: ID!
        points: Int!
    ): Match

    matchCreate(
        pid1: ID!
        pid2: ID!
        entry_fee_usd_cents: Int!
        prize_usd_cents: Int!
    ): Match

    matchDisqualify(
        mid: ID!
        pid: ID!
    ): Match

    matchEnd(
        mid: ID!
    ): Match

    playerCreate(
        playerInput: PlayerCreateInput
    ): Player

    playerDelete(pid: ID!): Boolean

    playerDeposit(
        pid: ID!
        amount_usd_cents: Int!
    ): Player

    playerUpdate(
        pid: ID!
        playerInput: PlayerUpdateInput
    ): Player

}

enum HandedEnum {
    ambi
    left
    right
}

enum WildcardBoolean {
    false
    true
}

input PlayerCreateInput {
    fname: String!
    handed: HandedEnum
    initial_balance_usd_cents: Int!
    lname: String
}

input PlayerUpdateInput {
    is_active: Boolean
    lname: String
}

type Player {
    balance_usd_cents: Int
    efficiency: Float
    fname: String
    handed: HandedEnum
    in_active_match: Match
    is_active: Boolean
    lname: String
    name: String
    num_dq: Int
    num_join: Int
    num_won: Int
    pid: ID!
    total_points: Int
    total_prize_usd_cents: Int
}

type Match {
    age: Int
    ended_at: String
    entry_fee_usd_cents: Int
    is_active: Boolean
    is_dq: Boolean
    mid: ID!
    p1: Player!
    p1_points: Int
    p2: Player!
    p2_points: Int
    prize_usd_cents: Int
    winner: Player
}

type Dashboard {
    avg_balance_usd_cents: Int
    num_active: Int
    num_inactive: Int
    num_total: Int
}

`);

const players = [
    {
      pid: '1',
      fname: 'John',
      lname: 'Doe',
      handed: 'right',
      initial_balance_usd_cents: 1000,
      balance_usd_cents: 1200,
      is_active: true,
      num_join: 5,
      num_won: 2,
      num_dq: 1,
      total_points: 50,
      total_prize_usd_cents: 5000,
    },
    {
      pid: '2',
      fname: 'Jane',
      lname: 'Doe',
      handed: 'left',
      initial_balance_usd_cents: 500,
      balance_usd_cents: 800,
      is_active: false,
      num_join: 2,
      num_won: 0,
      num_dq: 0,
      total_points: 20,
      total_prize_usd_cents: 0,
    },
  ];
  
  const matches = [
    {
      mid: '1',
      p1: players[0],
      p2: players[1],
      entry_fee_usd_cents: 1000,
      prize_usd_cents: 5000,
      p1_points: 20,
      p2_points: 30,
      ended_at: '2023-04-22T12:00:00Z',
      is_active: false,
      is_dq: false,
    }, {
        mid: '2',
        p1: players[0],
        p2: players[1],
        entry_fee_usd_cents: 1000,
        prize_usd_cents: 5000,
        p1_points: 20,
        p2_points: 30,
        ended_at: '2023-04-22T12:00:00Z',
        is_active: false,
        is_dq: false,
    },
  
  ];
  
const resolvers = {
    Query: {
        player: (parent, args, context, info) => {
            return players.find((player) => player.pid === args.pid);
        },
        players: (parent, args, context, info) => {
            let filteredPlayers = players;
            if (args.q) {
            filteredPlayers = filteredPlayers.filter(
                (player) =>
                player.fname.toLowerCase().includes(args.q.toLowerCase()) ||
                player.lname.toLowerCase().includes(args.q.toLowerCase())
            );
            }
            if (args.is_active !== undefined) {
            filteredPlayers = filteredPlayers.filter(
                (player) => player.is_active === args.is_active
            );
            }
            if (args.sort) {
            const [field, order] = args.sort.split('_');
            if (order === 'asc') {
                filteredPlayers.sort((a, b) => a[field] - b[field]);
            } else if (order === 'desc') {
                filteredPlayers.sort((a, b) => b[field] - a[field]);
            }
            }
            if (args.limit) {
            filteredPlayers = filteredPlayers.slice(
                args.offset,
                args.offset + args.limit
            );
            }
            return filteredPlayers;
        },
        match: (parent, args, context, info) => {
            return matches.find((match) => match.mid === args.mid);
        },
        matches: (parent, args, context, info) => {}
    }
}








/************************ ping ******************************************************/

app.get('/ping', (req, res, next) => {
    // res.render('home');
    // next();
    res.status(204).end()
    next();
})



/************************ graphQL api rewrite *************************************/

app.use("/graphql", graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true
}))

app.use((err, req, res, next) => {
    throw err;
    res.status(404).end();
    next();
})

/** remember to remove this line */
// app.listen(3000, () => console.log('Start listening on port 3000'));  


