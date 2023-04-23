'use strict';

const {  ert, expect } = require('chai');

const DEFAULT_TIMEOUT_MS = 4e3;
const { Fixture } = require('./fixture_hw7p1');


describe('mutation matchAward', function() {
  this.timeout(DEFAULT_TIMEOUT_MS);

  const fix = new Fixture();

  before(() => fix.before());
  after(() => fix.after());

  context('award p1', function() {
    it('response', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { p1_points, p2_points }} = data;

      expect(p1_points).to.equal(award_points);
      expect(p2_points).to.equal(0);
    });

    it('database', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      
      const _p1_points = await fix._match_get(mid, 'p1_points');
      expect(_p1_points).to.equal(award_points);
    });
  });

  context('award p2', function() {
    it('response', async function() {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p2_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { p1_points, p2_points }} = data;

      expect(p2_points).to.equal(award_points);
      expect(p1_points).to.equal(0);
    });
    
    it('database', async function() {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p2_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
    
      const _p2_points = await fix._match_get(mid, 'p2_points');
      expect(_p2_points).to.equal(award_points);
    });
  });

  
  context('active match, active player, valid points', function () {
    it('responds with correct match', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { mid }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { mid: _mid }} = data;

      expect(_mid).to.equal(mid);
    });

    it('increment from zero points', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { p1_points: _p1_points }} = data;

      expect(_p1_points).to.equal(award_points);
    });
  
    it('award points > 1', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = 4;
      const vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { p1_points: _p1_points }} = data;

      expect(_p1_points).to.equal(award_points);
    });

    it('increment from non-zero points', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const init_points = 4;
      await fix._match_award(mid, p1_id, init_points);

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { p1_points }} = data;

      expect(p1_points).to.equal(init_points + award_points);
    });

    it('sequential calls', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      let vars, q;

      const award_points1 = 1;
      vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points1
      };

      q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      await fix.graphql(q, vars, true);

      const award_points2 = 1;
      vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points2
      };

      q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { p1_points }} = data;

      expect(p1_points).to.equal(award_points1 + award_points2);
    });

    it('increment player2 points', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p2_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { p2_points: _p2_points }} = data;

      expect(_p2_points).to.equal(award_points);
    });

    it('increment both points', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      let vars, q;

      const award_points1 = 1;
      vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points1
      };

      q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      await fix.graphql(q, vars, true);

      const award_points2 = 1;
      vars = {
        mid:    mid,
        pid:    p2_id,
        points: award_points2
      };

      q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { p1_points, p2_points }} = data;

      expect(p1_points).to.equal(award_points1);
      expect(p2_points).to.equal(award_points2);
    });
  });


  context('invalid points', function () {
    it('must be (strictly) positive', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = -1;
      const vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;

      const { p1_points, p2_points } = await fix._match_get(mid);
    
      expect(p1_points || 0).to.equal(0);
      expect(p2_points || 0).to.equal(0);
    });
  });

  
  context('invalid player', function () {
    it('player does not exist', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const award_points = 1;
      const px_id = fix.random_id();
      const vars = {
        mid:    mid,
        pid:    px_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;

      const { p1_points, p2_points } = await fix._match_get(mid);
    
      expect(p1_points || 0).to.equal(0);
      expect(p2_points || 0).to.equal(0);
    });

    it('player is not in match', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();
      const p3_id = await fix._player_create();

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p3_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;

      const { p1_points, p2_points } = await fix._match_get(mid);
    
      expect(p1_points || 0).to.equal(0);
      expect(p2_points || 0).to.equal(0);
    });
  });

  context('invalid match', function () {
    it('match does not exist', async function () {
      const p1_id = await fix._player_create();
      const mx_id = fix.random_id();

      const award_points = 1;
      const vars = {
        mid:    mx_id,
        pid:    p1_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });

    it('match is not active', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();
      await fix._match_end(mid);

      const award_points = 1;
      const vars = {
        mid:    mid,
        pid:    p1_id,
        points: award_points
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
        $points: Int!
      ) {
        uut: matchAward(
          mid: $mid
          pid: $pid
          points: $points
        ) { p1_points, p2_points }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });


  // TODO: verify db value
  // TODO: VERIFY RESPONSE VALUE
  // TODO: UPDATE AGAIN, VERIFY RESPONSE VALUE
  // TODO: P1 vs P2 award
});


describe('mutation matchCreate', function() {
  this.timeout(DEFAULT_TIMEOUT_MS);

  const fix = new Fixture();

  before(() => fix.before());
  after(() => fix.after());


  context('active players', function () {
    it('success', async () => {
      const amount_usd_cents = 1000;

      const [p1_id, p2_id] = await Promise.all([
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        }),
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        })
      ]);

      const vars = fix.graphql_match_param({
        entry_fee_usd_cents:  amount_usd_cents,
        pid1:                 p1_id,
        pid2:                 p2_id
      });

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

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { mid: _mid }} = data;

      expect(_mid).to.be.ok.and.ObjectIdString;
    });

    it('players in match', async function () {
      const amount_usd_cents = 1000;

      const [p1_id, p2_id] = await Promise.all([
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        }),
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        })
      ]);

      const vars = fix.graphql_match_param({
        entry_fee_usd_cents:  amount_usd_cents,
        pid1:                 p1_id,
        pid2:                 p2_id
      });

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

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { mid: _mid }} = data;
      
      const { p1_id: _p1_id, p2_id: _p2_id } = await fix._match_get(_mid);

      expect(_p1_id).to.equal(p1_id);
      expect(_p2_id).to.equal(p2_id);
    });

    it('entry reduces player balance_usd_cents', async function () {
      const balance_usd_cents = 1000;
      const entry_fee_usd_cents = balance_usd_cents - 100;

      const [p1_id, p2_id] = await Promise.all([
        fix._player_create({
          balance_usd_cents
        }),
        fix._player_create({
          balance_usd_cents
        })
      ]);

      const vars = fix.graphql_match_param({
        entry_fee_usd_cents:  entry_fee_usd_cents,
        pid1:                 p1_id,
        pid2:                 p2_id
      });

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

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { mid: _mid }} = data;
      
      const [_p1_balance, _p2_balance] = await Promise.all([
        fix._player_get(p1_id, 'balance_usd_cents'),
        fix._player_get(p2_id, 'balance_usd_cents')
      ]);

      expect(_p1_balance).to.equal(balance_usd_cents - entry_fee_usd_cents);
      expect(_p2_balance).to.equal(balance_usd_cents - entry_fee_usd_cents);
    });
  });
  

  context('invalid player', function () {
    it('player does not exist', async function () {
      const amount_usd_cents = 1000;

      const [p1_id, p2_id] = await Promise.all([
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        }),
        fix.random_id()
      ]);

      const vars = fix.graphql_match_param({
        entry_fee_usd_cents:  amount_usd_cents,
        pid1:                 p1_id,
        pid2:                 p2_id
      });

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

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });

    it('player is in active match', async function () {
      const amount_usd_cents = 1000;
      // small enough to join twice
      const entry_fee_usd_cents = 100;

      const [p1_id, p2_id, p3_id] = await Promise.all([
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        }),
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        }),
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        })
      ]);

      let vars;

      vars = fix.graphql_match_param({
        entry_fee_usd_cents:  entry_fee_usd_cents,
        pid1:                 p1_id,
        pid2:                 p2_id
      });

      // graphql call to allow submission
      // to create fields
      await fix.graphqlMatchCreate(vars);

      vars = fix.graphql_match_param({
        entry_fee_usd_cents:  entry_fee_usd_cents,
        pid1:                 p1_id,
        pid2:                 p3_id
      });

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

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });

    it('insufficient balance', async function () {
      const balance_usd_cents = 1000;
      const entry_fee_usd_cents = balance_usd_cents + 100;

      const [p1_id, p2_id] = await Promise.all([
        fix._player_create({
          balance_usd_cents
        }),
        fix._player_create({
          balance_usd_cents
        })
      ]);

      const vars = fix.graphql_match_param({
        entry_fee_usd_cents:  entry_fee_usd_cents,
        pid1:                 p1_id,
        pid2:                 p2_id
      });

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

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;

      // no changes to balance
      
      const [_p1_balance, _p2_balance] = await Promise.all([
        fix._player_get(p1_id, 'balance_usd_cents'),
        fix._player_get(p2_id, 'balance_usd_cents')
      ]);

      expect(_p1_balance).to.equal(balance_usd_cents);
      expect(_p2_balance).to.equal(balance_usd_cents);
    });
  });


  context('prize_usd_cents', function () {
    it('must be (strictly) positive', async () => {
      const amount_usd_cents = 1000;
      const prize_usd_cents = -100;

      const [p1_id, p2_id] = await Promise.all([
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        }),
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        })
      ]);

      const vars = fix.graphql_match_param({
        prize_usd_cents:  prize_usd_cents,
        pid1:             p1_id,
        pid2:             p2_id
      });

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

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });


  context('entry_fee_usd_cents', function () {
    it('must be (strictly) positive', async () => {
      const amount_usd_cents = 1000;
      const entry_fee_usd_cents = -100;

      const [p1_id, p2_id] = await Promise.all([
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        }),
        fix._player_create({
          balance_usd_cents: amount_usd_cents
        })
      ]);

      const vars = fix.graphql_match_param({
        entry_fee_usd_cents:  entry_fee_usd_cents,
        pid1:                 p1_id,
        pid2:                 p2_id
      });

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

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });


  it('database record', async function () {
    const amount_usd_cents = 1000;
    const entry_fee_usd_cents = 100;
    const prize_usd_cents = 100;

    const [p1_id, p2_id] = await Promise.all([
      fix._player_create({
        balance_usd_cents: amount_usd_cents
      }),
      fix._player_create({
        balance_usd_cents: amount_usd_cents
      })
    ]);

    const vars = fix.graphql_match_param({
      entry_fee_usd_cents:  entry_fee_usd_cents,
      pid1:                 p1_id,
      pid2:                 p2_id,
      prize_usd_cents:      prize_usd_cents
    });

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

    const { data } = await fix.graphql(q, vars, true);
    const { uut: { mid: _mid }} = data;
    
    const { 
      entry_fee_usd_cents:  _entry_fee_usd_cents,
      p1_id:                _p1_id,
      p1_points:            _p1_points,
      p2_id:                _p2_id,
      p2_points:            _p2_points,
      prize_usd_cents:      _prize_usd_cents,
    } = await fix._match_get(_mid);

    expect(_p1_id).to.be.ObjectIdString;
    expect(_p1_id).to.be.ObjectIdString;

    expect(_p1_points || 0).to.equal(0);
    expect(_p2_points || 0).to.equal(0);

    expect(_entry_fee_usd_cents).to.equal(entry_fee_usd_cents);
    expect(_prize_usd_cents).to.equal(prize_usd_cents);
  });
});


describe('mutation matchDisqualify', function() {
  this.timeout(DEFAULT_TIMEOUT_MS);

  const fix = new Fixture();

  before(() => fix.before());
  after(() => fix.after());

  context('active match, active player', function () {
    it('responds with correct match', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const vars = {
        mid:    mid,
        pid:    p1_id
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
      ) {
        uut: matchDisqualify(
          mid: $mid
          pid: $pid
        ) { mid }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { mid: _mid }} = data;

      expect(_mid).to.equal(mid);
    });

    it('sets ended_at', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      const vars = {
        mid:    mid,
        pid:    p1_id
      };

      const q = `mutation(
        $mid:    ID!
        $pid:    ID!
      ) {
        uut: matchDisqualify(
          mid: $mid
          pid: $pid
        ) { mid }
      }`;

      await fix.graphql(q, vars, true);

      const ended_at = await fix._match_get(mid, 'ended_at');
      expect(ended_at).to.be.an.instanceof(Date);
    });

    it('award prize to win player', async function () {
      const prize_usd_cents = 100;

      const { mid, p1_id, p2_id } = await fix._match_create({
        prize_usd_cents: prize_usd_cents
      });

      const _p1_balance_pre = await fix._player_get(p1_id, 'balance_usd_cents');

      const vars = {
        mid:  mid,
        pid:  p2_id
      };

      const q = `mutation(
        $mid: ID!
        $pid: ID!
      ) {
        uut: matchDisqualify(
          mid: $mid
          pid: $pid
        ) { mid }
      }`;

      const { data } = await fix.graphql(q, vars, true);

      const _p1_balance_post = await fix._player_get(p1_id, 'balance_usd_cents');
    
      expect(_p1_balance_post).to.be.equal(_p1_balance_pre + prize_usd_cents);
    });
    
    it('no prize to lose player', async function () {
      const prize_usd_cents = 100;

      const { mid, p1_id, p2_id } = await fix._match_create({
        prize_usd_cents: prize_usd_cents
      });

      const _p1_balance_pre = await fix._player_get(p1_id, 'balance_usd_cents');

      const vars = {
        mid:  mid,
        pid:  p1_id
      };

      const q = `mutation(
        $mid: ID!
        $pid: ID!
      ) {
        uut: matchDisqualify(
          mid: $mid
          pid: $pid
        ) { mid }
      }`;

      const { data } = await fix.graphql(q, vars, true);

      const _p1_balance_post = await fix._player_get(p1_id, 'balance_usd_cents');
    
      expect(_p1_balance_post).to.be.equal(_p1_balance_pre);
    });
  });


  context('not active match', function () {
    it('match is not active', async function() {
      const { mid, p1_id, p2_id } = await fix._match_create();
      await fix._match_end(mid);
      
      const vars = {
        mid:  mid,
        pid:  p1_id
      };

      const q = `mutation(
        $mid: ID!
        $pid: ID!
      ) {
        uut: matchDisqualify(
          mid: $mid
          pid: $pid
        ) { mid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
    
    it('match does not exist', async function() {
      const [p1_id, p2_id] = await Promise.all([
        fix._player_create(),
        fix._player_create()
      ]);

      const vars = {
        mid:  fix.random_id(),
        pid:  p1_id
      };

      const q = `mutation(
        $mid: ID!
        $pid: ID!
      ) {
        uut: matchDisqualify(
          mid: $mid
          pid: $pid
        ) { mid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });


  context('invalid player', function () {
    it('player does not exist', async function() {
      const { mid, p1_id, p2_id } = await fix._match_create();
      
      const vars = {
        mid:  mid,
        pid:  fix.random_id()
      };

      const q = `mutation(
        $mid: ID!
        $pid: ID!
      ) {
        uut: matchDisqualify(
          mid: $mid
          pid: $pid
        ) { mid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
    
    it('player is not in match', async function() {
      const [
        { mid, p1_id, p2_id },
        p3_id
      ] = await Promise.all([
        fix._match_create(),
        fix._player_create()
      ]);
      
      const vars = {
        mid:  mid,
        pid:  p3_id
      };

      const q = `mutation(
        $mid: ID!
        $pid: ID!
      ) {
        uut: matchDisqualify(
          mid: $mid
          pid: $pid
        ) { mid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });
});


describe('mutation matchEnd', function() {
  this.timeout(DEFAULT_TIMEOUT_MS);

  const fix = new Fixture();

  before(() => fix.before());
  after(() => fix.after());

  context('active match, active player', function () {
    it('responds with correct match', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();

      await fix._match_award(mid, p1_id);

      const vars = {
        mid: mid
      };

      const q = `mutation(
        $mid:    ID!
      ) {
        uut: matchEnd(
          mid: $mid
        ) { mid }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { mid: _mid }} = data;

      expect(_mid).to.equal(mid);
    });

    it('sets ended_at', async function () {
      const { mid, p1_id, p2_id } = await fix._match_create();
      
      await fix._match_award(mid, p1_id);

      const vars = {
        mid:    mid
      };

      const q = `mutation(
        $mid:    ID!
      ) {
        uut: matchEnd(
          mid: $mid
        ) { mid }
      }`;

      await fix.graphql(q, vars, true);

      const ended_at = await fix._match_get(mid, 'ended_at');
      expect(ended_at).to.be.an.instanceof(Date);
    });

    it('award prize to win player', async function () {
      const prize_usd_cents = 100;

      const { mid, p1_id, p2_id } = await fix._match_create({
        prize_usd_cents: prize_usd_cents
      });
      
      await fix._match_award(mid, p1_id);

      const _p1_balance_pre = await fix._player_get(p1_id, 'balance_usd_cents');

      const vars = {
        mid:  mid
      };

      const q = `mutation(
        $mid: ID!
      ) {
        uut: matchEnd(
          mid: $mid
        ) { mid }
      }`;

      const { data } = await fix.graphql(q, vars, true);

      const _p1_balance_post = await fix._player_get(p1_id, 'balance_usd_cents');
    
      expect(_p1_balance_post).to.be.equal(_p1_balance_pre + prize_usd_cents);
    });
    
    it('no prize to lose player', async function () {
      const prize_usd_cents = 100;

      const { mid, p1_id, p2_id } = await fix._match_create({
        prize_usd_cents: prize_usd_cents
      });
      
      await fix._match_award(mid, p2_id);

      const _p1_balance_pre = await fix._player_get(p1_id, 'balance_usd_cents');

      const vars = {
        mid:  mid
      };

      const q = `mutation(
        $mid: ID!
      ) {
        uut: matchEnd(
          mid: $mid
        ) { mid }
      }`;

      const { data } = await fix.graphql(q, vars, true);

      const _p1_balance_post = await fix._player_get(p1_id, 'balance_usd_cents');
    
      expect(_p1_balance_post).to.be.equal(_p1_balance_pre);
    });
  });


  context('not active match', function () {
    it('match is not active', async function() {
      const { mid, p1_id, p2_id } = await fix._match_create();
      
      await fix._match_award(mid, p1_id);
      await fix._match_end(mid);
      
      const vars = {
        mid:  mid
      };

      const q = `mutation(
        $mid: ID!
      ) {
        uut: matchEnd(
          mid: $mid
        ) { mid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
    
    it('match does not exist', async function() {
      const vars = {
        mid:  fix.random_id()
      };

      const q = `mutation(
        $mid: ID!
      ) {
        uut: matchEnd(
          mid: $mid
        ) { mid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });

    it('cannot end tied (at zero) match', async function() {
      const { mid, p1_id, p2_id } = await fix._match_create();
      
      const vars = {
        mid:  mid
      };

      const q = `mutation(
        $mid: ID!
      ) {
        uut: matchEnd(
          mid: $mid
        ) { mid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });

    it('cannot end tied (at non-zero) match', async function() {
      const { mid, p1_id, p2_id } = await fix._match_create();
      
      await Promise.all([
        await fix._match_award(mid, p1_id, 1),
        await fix._match_award(mid, p2_id, 1)
      ]);
      
      const vars = {
        mid:  mid
      };

      const q = `mutation(
        $mid: ID!
      ) {
        uut: matchEnd(
          mid: $mid
        ) { mid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });


    it('cannot end tied (at non-zero, multiple increment) match', async function() {
      const { mid, p1_id, p2_id } = await fix._match_create();
      
      await Promise.all([
        await fix._match_award(mid, p1_id, 1),
        await fix._match_award(mid, p2_id, 1)
      ]);
      
      await Promise.all([
        await fix._match_award(mid, p1_id, 1),
        await fix._match_award(mid, p2_id, 1)
      ]);
      
      const vars = {
        mid:  mid
      };

      const q = `mutation(
        $mid: ID!
      ) {
        uut: matchEnd(
          mid: $mid
        ) { mid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });
});
