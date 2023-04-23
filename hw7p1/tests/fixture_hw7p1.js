'use strict';

const chai = require('chai');
const { expect } = chai;

const { Fixture } = require('../lib/fixture');
const fs = require('fs');
const path = require('path');

const { URL } = require('url');
const qs = require('querystring');

const { MongoClient, ObjectId } = require('mongodb');

const {
  random_string
} = require('../lib/util');

const INTERPRETER = 'node';
const SCRIPT_TO_TEST = `${__dirname}/../hw7p1.js`;

const URL_MAP = {
  GRAPHQL: {
    method: 'POST',
    path:   '/graphql'
  },
  PING: {
    method: 'GET',
    path:   '/ping'
  }
};

const WWW = {
  host:  'localhost',
  port:  '3000',
  proto: 'http'
};

const MONGO_CONNECTION = {
  host: process.env.MONGO_HOST || 'localhost',
  port: '27017',
  db:   'ee547_hw',
  opts: {
    useUnifiedTopology: true
  }
};

const MONGO_COLLECTION = {
  MATCH:  'match',
  PLAYER: 'player'
};


const HANDED_MAP = {
  A: 'ambi',
  L: 'left',
  R: 'right'
};

// player defaults
const DEFAULT_FNAME   = random_string();
const DEFAULT_LNAME   = random_string();
const DEFAULT_HANDED  = 'L';
const DEFAULT_INITIAL = 566;

// match defaults
const DEFAULT_ENTRY_FEE = 600;
const DEFAULT_PRIZE = 1000;

// REUSABLE
let url, body, status, headers;


const MONGO_CONFIG_FILE = `${__dirname}/../config/mongo.json`;

class Hw7P1Fixture extends Fixture {
  constructor() {
    super(INTERPRETER, SCRIPT_TO_TEST);

    this.setWwwOpts(WWW);
  }

  static URL_MAP = URL_MAP;
  static HANDED_MAP = HANDED_MAP;

  async _connect() {
    /*
    if (this._mongoConnect) {
      return;
    }
    */

    const { host, port, db, opts } = {
      ...MONGO_CONNECTION
    };

    const u = new URL(`mongodb://${host}:${port}`);
    u.search = qs.encode(opts);

    try {
      this._mongoConnect = await MongoClient.connect(u.href);
      this._mongoDb = this._mongoConnect.db(db);
    } catch(err) {
      console.error(`mongodb connection error -- ${err}`);
      process.exit(5);
    }
  }


  async _close() {
    if (this._mongoConnect) {
      return this._mongoConnect.close();
      this._mongoConnect = null;
    }
  }


  async before() {
    this.write_config();
    await this._connect();
    await this._db_flush();
    await super.before();
  }


  async after() {
    await super.after();
    await this._close();
  }


  // if rawData no output processing
  write_config(data = {}, rawData) {
    if (rawData === undefined) {
      data = {
        ...MONGO_CONNECTION,
        ...data
      };
      data = JSON.stringify(data);
    } else {
      data = rawData;
    }

    const dir = path.dirname(MONGO_CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(MONGO_CONFIG_FILE, data);
  }


  _db_flush() {
    if (this._mongoDb) {
      return this._mongoDb.dropDatabase();
    }
  }


  random_id() {
    return random_string(24, false, 'abcdef0123456789');
  }


  object_id(id) {
    return new ObjectId(id);
  }


  // ENTITY HELPERS

  /*********************************************************
   * 
   * PLAYER
   *
   *********************************************************/
  
  // return obj, use params and replace missing with DEFAULT
  graphql_player_param(data) {
    const DEFAULT_DATA = {
      fname:                     DEFAULT_FNAME,
      lname:                     DEFAULT_LNAME,
      handed:                    HANDED_MAP[DEFAULT_HANDED],
      initial_balance_usd_cents: DEFAULT_INITIAL
    }

    return { ...DEFAULT_DATA, ...data };
  }


  async graphqlPlayerCreate(variables = {}) {
    variables = {...this.graphql_player_param(), ...variables};

    const q = `mutation(
      $fname:                     String!
      $handed:                    HandedEnum!
      $initial_balance_usd_cents: Int!
      $lname:                     String!
    ) {
      uut: playerCreate(
        playerInput:{
          fname: $fname
          lname: $lname
          handed: $handed
          initial_balance_usd_cents: $initial_balance_usd_cents
        }
      ) { pid }
    }`;

    const { data } = await this.graphql(q, variables, true);
    const { uut: { pid }} = data;

    return pid;
  }

  // return obj, use params and replace missing with DEFAULT
  _player_create_defs(data) {
    const DEFAULT_DATA = {
      fname:             DEFAULT_FNAME,
      lname:             DEFAULT_LNAME,
      handed:            DEFAULT_HANDED,
      balance_usd_cents: DEFAULT_INITIAL,
      is_active:         true
    }

    return { ...DEFAULT_DATA, ...data };
  }


  // add player with data (defaults: _add_player_defs)
  // return pid
  async _player_create(data = {}) {
    const doc = this._player_create_defs(data);

    const { insertedId: _id } = await this._mongoDb.collection(MONGO_COLLECTION.PLAYER).insertOne(doc);

    return _id.toString();
  }


  _player_get(pid, field = null) {
    const selector = {
      _id: new ObjectId(pid)
    };

    return this._mongoDb.collection(MONGO_COLLECTION.PLAYER)
      .findOne(selector)
      .then(x => field ? x?.[field] : x);
  }


  async _player_list() {
    const docs = await this._mongoDb.collection(MONGO_COLLECTION.PLAYER).find({}, { projection: { _id: true } }).toArray();
    return docs.map(({ _id }) => _id.toString());
  }
  

  _player_exist(pid) {
    return this._mongoDb.collection(MONGO_COLLECTION.PLAYER)
      .findOne({ _id: new ObjectId(pid) })
      .then(x => !!x);
  }


  /*********************************************************
   * 
   * MATCH
   *
   *********************************************************/
  
  // return obj, use params and replace missing with DEFAULT
  graphql_match_param(data) {
    const DEFAULT_DATA = {
      entry_fee_usd_cents: DEFAULT_ENTRY_FEE,
      prize_usd_cents:     DEFAULT_PRIZE
    }

    return { ...DEFAULT_DATA, ...data };
  }


  async graphqlMatchCreate(variables = {}) {
    variables = {...this.graphql_match_param(), ...variables};

    const q = `mutation(
      $pid1:                ID!
      $pid2:                ID!
      $entry_fee_usd_cents: Int!
      $prize_usd_cents:     Int!
    ) {
      uut: matchCreate(
        pid1: $pid1
        pid2: $pid2
        entry_fee_usd_cents: $entry_fee_usd_cents
        prize_usd_cents: $prize_usd_cents
      ) { mid }
    }`;

    const { data } = await this.graphql(q, variables, true);
    const { uut: { mid }} = data;

    return mid;
  }


  // return obj, use params and replace missing with DEFAULT
  _match_create_defs(data) {
    const DEFAULT_DATA = {
      created_at:          new Date(),
      entry_fee_usd_cents: DEFAULT_ENTRY_FEE,
      prize_usd_cents:     DEFAULT_PRIZE
    }

    return { ...DEFAULT_DATA, ...data };
  }


  // add match with data (defaults: _add_match_defs)
  // return mid
  async _match_create(data = {}) {
    const [p1_id, p2_id] = await Promise.all([
      'p1_id' in data ? data.p1_id : this._player_create(),
      'p2_id' in data ? data.p2_id : this._player_create()
    ]);

    Object.assign(data, {
      p1_id: new ObjectId(p1_id),
      p2_id: new ObjectId(p2_id)
    });

    const doc = this._match_create_defs(data);

    const { insertedId: _id } = await this._mongoDb.collection(MONGO_COLLECTION.MATCH).insertOne(doc);

    return { mid: _id.toString(), p1_id, p2_id };
  }


  // award points to pid in mid
  // only check that pid is in match, no check for is_active, etc.
  async _match_award(mid, pid, points = 1) {
    const { p1_id, p2_id } = await this._match_get(mid);

    const IS_P1 = (pid === p1_id.toString());
    const IS_P2 = (pid === p2_id.toString());

    const selector = { _id: new ObjectId(mid) };
    const data = {};

    if (IS_P1) {
      data.p1_points = points;
    }

    if (IS_P2) {
      data.p2_points = points;
    }

    if (!(IS_P1 || IS_P2)) {
      console.error(`cannot award points to non participant player -- pid:${pid}, p1:${p1_id.toString()}, p2:${p2_id.toString()}`);
      return;
    }

    return this._mongoDb.collection(MONGO_COLLECTION.MATCH).updateOne(selector, { $inc: data }, { upsert: false });
  }


  // end mid
  // do not check for active or winner, just update fields
  async _match_end(mid) {
    const selector = { _id: new ObjectId(mid) };    
    const data = {
      ended_at: new Date()
    };

    return this._mongoDb.collection(MONGO_COLLECTION.MATCH).updateOne(selector, { $set: data }, { upsert: false });
  }


  _match_get(mid, field = null) {
    const selector = {
      _id: new ObjectId(mid)
    };

    return this._mongoDb.collection(MONGO_COLLECTION.MATCH)
      .findOne(selector)
      .then(x => field ? x?.[field] : x);
  }


  async _match_list() {
    const docs = await this._mongoDb.collection(MONGO_COLLECTION.MATCH).find({}, { projection: { _id: true } }).toArray();
    return docs.map(({ _id }) => _id.toString());
  }
}


module.exports = {
  Fixture: Hw7P1Fixture
}
