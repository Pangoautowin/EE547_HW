'use strict';

const { assert, expect } = require('chai');

const DEFAULT_TIMEOUT_MS = 4e3;
const { Fixture } = require('./fixture_hw7p1');


describe('mutation playerCreate', function() {
  this.timeout(DEFAULT_TIMEOUT_MS);

  const fix = new Fixture();

  before(() => fix.before());
  after(() => fix.after());


  it('valid success', async function () {
    const vars = {
      ...fix.graphql_player_param()
    };

    const q = `mutation(
      $fname:                     String!
      $handed:                    HandedEnum!
      $initial_balance_usd_cents: Int!
      $lname:                     String!
    ) {
      uut: playerCreate(
        playerInput:{
          fname:  $fname
          lname:  $lname
          handed: $handed
          initial_balance_usd_cents: $initial_balance_usd_cents
        }
      ) { pid }
    }`;
    
    const { data, errors } = await fix.graphql(q, vars, true);
    const { uut: { pid }} = data;

    const isExist = await fix._player_exist(pid);
    expect(isExist).to.be.true;
  });


  context('field: pid', async function () {
    it('is ObjectId', async function () {
      const vars = {
        ...fix.graphql_player_param()
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { pid }} = data;

      expect(pid).to.be.valid.ObjectIdString;
    });
  });


  context('field: fname', async function () {
    it('valid', async function () {
      const fname = 'altfname';
      const vars = {
        ...fix.graphql_player_param(),
        fname
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;

      const { data, errors } = await fix.graphql(q, vars, true);
      const { uut: { pid }} = data;

      const _fname = await fix._player_get(pid, 'fname');
      expect(_fname).to.equal(fname);
    });

    it('invalid: blank', async function () {
      const fname = '';
      const vars = {
        ...fix.graphql_player_param(),
        fname
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;
  
      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });

    it('invalid: char', async function () {
      const fnames = [
        'stan-ville',
        'j4nn',
        'mary.k'
      ];

      await Promise.all(fnames.map(async fname => {
        const vars = {
          ...fix.graphql_player_param(),
          fname
        };
  
        const q = `mutation(
          $fname:                     String!
          $handed:                    HandedEnum!
          $initial_balance_usd_cents: Int!
          $lname:                     String!
        ) {
          uut: playerCreate(
            playerInput:{
              fname:  $fname
              lname:  $lname
              handed: $handed
              initial_balance_usd_cents: $initial_balance_usd_cents
            }
          ) { pid }
        }`;
  
        const { data, errors } = await fix.graphql(q, vars);
        const { uut: _uut} = data;
  
        expect(errors).to.be.an('array').with.length(1);
        expect(_uut).to.be.null;
      }));
    });

    it('invalid: space', async function () {
      const fname = 'my fname';
      const vars = {
        ...fix.graphql_player_param(),
        fname
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });

  
  context('field: lname', async function () {
    it('valid', async function () {
      const lname = 'altlname';
      const vars = {
        ...fix.graphql_player_param(),
        lname
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { pid }} = data;

      const _lname = await fix._player_get(pid, 'lname');
      expect(_lname).to.equal(lname);
    });

    it('valid: blank', async function () {
      const lname = '';
      const vars = {
        ...fix.graphql_player_param(),
        lname
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { pid }} = data;

      const _lname = await fix._player_get(pid, 'lname');
      expect(_lname).to.equal(lname);
    });

    it ('invalid: char', async function () {
      const lnames = [
        'my-lname',
        'sm1th',
        'jo.beth'
      ];

      await Promise.all(lnames.map(async lname => {
        const vars = {
          ...fix.graphql_player_param(),
          lname
        };
  
        const q = `mutation(
          $fname:                     String!
          $handed:                    HandedEnum!
          $initial_balance_usd_cents: Int!
          $lname:                     String!
        ) {
          uut: playerCreate(
            playerInput:{
              fname:  $fname
              lname:  $lname
              handed: $handed
              initial_balance_usd_cents: $initial_balance_usd_cents
            }
          ) { pid }
        }`;
  
        const { data, errors } = await fix.graphql(q, vars);
        const { uut: _uut} = data;
  
        expect(errors).to.be.an('array').with.length(1);
        expect(_uut).to.be.null;
      }));
    });

    it('invalid: space', async function () {
      const lname = 'my lname';
      const vars = {
        ...fix.graphql_player_param(),
        lname
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });

  
  context('field: initial_balance', async function () {
    it('valid', async function () {
      const initial_balance_usd_cents = 4321;
      const vars = {
        ...fix.graphql_player_param(),
        initial_balance_usd_cents
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { pid }} = data;

      const _balance_usd_cents = await fix._player_get(pid, 'balance_usd_cents');
      expect(_balance_usd_cents).to.equal(initial_balance_usd_cents);
    });

    it('must be (strictly) positive', async function () {
      const initial_balance_usd_cents = -100;
      const vars = {
        ...fix.graphql_player_param(),
        initial_balance_usd_cents
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut} = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });

  
  context('field: handed', async function () {
    it('valid', async function () {
      const handed = 'ambi';
      const vars = {
        ...fix.graphql_player_param(),
        handed
      };

      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: { pid }} = data;

      const _handed = await fix._player_get(pid, 'handed');
      expect(_handed).to.equal(Fixture.MAP.b(Fixture.HANDED_MAP, handed));
    });
  });

  
  context('field: is_active', async function () {
    it('default is_active=true', async function () {
      const vars = {
        ...fix.graphql_player_param()
      };
  
      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;
  
      const { data } = await fix.graphql(q, vars, true);
      const { uut: { pid }} = data;

      const is_active = await fix._player_get(pid, 'is_active');
      expect(is_active).to.equal(true);
    });
  });

  
  context('field: created_at', async function () {
    it('created_at set', async function () {
      const vars = {
        ...fix.graphql_player_param()
      };
  
      const q = `mutation(
        $fname:                     String!
        $handed:                    HandedEnum!
        $initial_balance_usd_cents: Int!
        $lname:                     String!
      ) {
        uut: playerCreate(
          playerInput:{
            fname:  $fname
            lname:  $lname
            handed: $handed
            initial_balance_usd_cents: $initial_balance_usd_cents
          }
        ) { pid }
      }`;
  
      const { data } = await fix.graphql(q, vars, true);
      const { uut: { pid }} = data;
  
      const created_at = await fix._player_get(pid, 'created_at');
      expect(created_at).to.be.an.instanceof(Date);
    });
  });


  it('response fields not stale', async function () {
    const vars = {
      ...fix.graphql_player_param(),
    };

    const q = `mutation(
      $fname:                     String!
      $handed:                    HandedEnum!
      $initial_balance_usd_cents: Int!
      $lname:                     String!
    ) {
      uut: playerCreate(
        playerInput:{
          fname:  $fname
          lname:  $lname
          handed: $handed
          initial_balance_usd_cents: $initial_balance_usd_cents
        }
      ) {
        fname
        lname
        balance_usd_cents
        handed
      }
    }`;

    const { data } = await fix.graphql(q, vars, true);
    const { uut: {
      fname: _fname,
      balance_usd_cents: _balance_usd_cents,
      handed: _handed,
      lname: _lname,
    }} = data;

    expect(_fname).to.equal(vars.fname);
    expect(_handed).to.equal(vars.handed);
    expect(_balance_usd_cents).to.equal(vars.initial_balance_usd_cents);
    expect(_lname).to.equal(vars.lname);
  });


  it('database record', async function () {
    const vars = {
      ...fix.graphql_player_param()
    };

    const q = `mutation(
      $fname:                     String!
      $handed:                    HandedEnum!
      $initial_balance_usd_cents: Int!
      $lname:                     String!
    ) {
      uut: playerCreate(
        playerInput:{
          fname:  $fname
          lname:  $lname
          handed: $handed
          initial_balance_usd_cents: $initial_balance_usd_cents
        }
      ) { pid }
    }`;

    const { data } = await fix.graphql(q, vars, true);
    const { uut: { pid }} = data;

    const ddata = await fix._player_get(pid);

    expect(ddata).to.not.be.null;
    expect(ddata).to.have.property('fname', vars.fname);
    expect(ddata).to.have.property('lname', vars.lname);
    expect(ddata).to.have.property('handed', Fixture.MAP.b(Fixture.HANDED_MAP, vars.handed));
    expect(ddata).to.have.property('balance_usd_cents', vars.initial_balance_usd_cents);
  });
});


describe('mutation playerDelete', function () {
  this.timeout(DEFAULT_TIMEOUT_MS);

  const fix = new Fixture();

  before(() => fix.before());
  after(() => fix.after());

  context('valid player', function () {
    it('removes from db', async function () {
      let isExist = false;

      const pid = await fix.graphqlPlayerCreate();

      // verify db
      isExist = await fix._player_exist(pid);
      expect(isExist).to.be.true;

      // issue delete

      const q = `mutation(
        $pid: ID!
      ) {
        uut: playerDelete(
          pid: $pid
        )
      }`;

      await fix.graphql(q, { pid }, true);

      // verify db
      isExist = await fix._player_exist(pid);
      expect(isExist).to.be.false;
    });
    
    it('player deleted', async function () {
      const pid = await fix._player_create();
      
      const vars = {
        pid
      };

      const q = `mutation(
        $pid:    ID!
      ) {
        uut: playerDelete(
          pid: $pid
        )
      }`;

      const { data, errors } = await fix.graphql(q, vars, true);
      const { uut: isSuccess } = data;

      expect(isSuccess).to.equal(true);
    });

    it('player deleted, x2', async function () {
      const pid = await fix._player_create();
      
      const vars = {
        pid
      };

      const q = `mutation(
        $pid:    ID!
      ) {
        uut1: playerDelete(
          pid: $pid
        ),
        uut2: playerDelete(
          pid: $pid
        )
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut1: isSuccess1, uut2: isSuccess2 } = data;

      expect(isSuccess1).to.equal(true);

      expect(errors).to.be.an('array').with.length(1);
      expect(isSuccess2).to.equal(null);
    });
  });


  context('invalid player', function () {
    it('player not exist', async function () {
      const pid = fix.random_id();
      
      const vars = {
        pid
      };

      const q = `mutation(
        $pid:    ID!
      ) {
        uut: playerDelete(
          pid: $pid
        )
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: isSuccess } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(isSuccess).to.equal(null);
    });
  });
});


describe('mutation playerDeposit', function () {
  this.timeout(DEFAULT_TIMEOUT_MS);

  const fix = new Fixture();

  before(() => fix.before());
  after(() => fix.after());


  context('valid player', function () {
    it('increments balance', async () => {
      const initial_balance_usd_cents = 4567;
      const amount_usd_cents = 1234;

      const pid = await fix._player_create({
        balance_usd_cents: initial_balance_usd_cents
      });

      const q = `mutation(
        $pid:              ID!
        $amount_usd_cents: Int!
      ) {
        uut: playerDeposit(
          pid: $pid
          amount_usd_cents: $amount_usd_cents
        ) { balance_usd_cents }
      }`;

      await fix.graphql(q, {
        pid,
        amount_usd_cents
      }, true);

      const _balance_usd_cents = await fix._player_get(pid, 'balance_usd_cents');
      expect(_balance_usd_cents).to.equal(initial_balance_usd_cents + amount_usd_cents);
    });


    context('resp', function () {
      it('resp user match', async function () {
        const amount_usd_cents = 1234;

        const pid = await fix._player_create();
        
        const vars = {
          pid,
          amount_usd_cents
        };

        const q = `mutation(
          $pid:              ID!
          $amount_usd_cents: Int!
        ) {
          uut: playerDeposit(
            pid: $pid
            amount_usd_cents: $amount_usd_cents
          ) { pid }
        }`;

        const { data } = await fix.graphql(q, vars, true);

        const { uut: { pid: _pid } } = data;
        expect(_pid).to.equal(pid);
      });


      it('resp not stale', async function () {
        const initial_balance_usd_cents = 4567;
        const amount_usd_cents = 1234;

        const pid = await fix._player_create({
          balance_usd_cents: initial_balance_usd_cents
        });

        const vars = {
          pid,
          amount_usd_cents
        };

        const q = `mutation(
          $pid:              ID!
          $amount_usd_cents: Int!
        ) {
          uut: playerDeposit(
            pid: $pid
            amount_usd_cents: $amount_usd_cents
          ) { balance_usd_cents }
        }`;

        const { data } = await fix.graphql(q, vars, true);

        const { uut: { balance_usd_cents: _balance_usd_cents } } = data;
        expect(_balance_usd_cents).to.equal(initial_balance_usd_cents + amount_usd_cents);
      });
    });


    context('amount_usd_cents', async function () {
      it('increment zero balance', async function () {
        const initial_balance_usd_cents = 0;
        const amount_usd_cents = 1234;

        const pid = await fix._player_create({
          balance_usd_cents: initial_balance_usd_cents
        });

        const vars = {
          pid,
          amount_usd_cents
        };

        const q = `mutation(
          $pid:              ID!
          $amount_usd_cents: Int!
        ) {
          uut: playerDeposit(
            pid: $pid
            amount_usd_cents: $amount_usd_cents
          ) { balance_usd_cents }
        }`;

        const { data } = await fix.graphql(q, vars, true);

        const { uut: { balance_usd_cents: _balance_usd_cents } } = data;
        expect(_balance_usd_cents).to.equal(initial_balance_usd_cents + amount_usd_cents);
      });
      
      it('increment non-zero balance', async function () {
        const initial_balance_usd_cents = 4567;
        const amount_usd_cents = 1234;

        const pid = await fix._player_create({
          balance_usd_cents: initial_balance_usd_cents
        });

        const vars = {
          pid,
          amount_usd_cents
        };

        const q = `mutation(
          $pid:              ID!
          $amount_usd_cents: Int!
        ) {
          uut: playerDeposit(
            pid: $pid
            amount_usd_cents: $amount_usd_cents
          ) { balance_usd_cents }
        }`;

        const { data } = await fix.graphql(q, vars, true);

        const { uut: { balance_usd_cents: _balance_usd_cents } } = data;
        expect(_balance_usd_cents).to.equal(initial_balance_usd_cents + amount_usd_cents);
      });
      
      it('no zero deposit', async function () {
        const initial_balance_usd_cents = 4567;
        const amount_usd_cents = 0;

        const pid = await fix._player_create({
          balance_usd_cents: initial_balance_usd_cents
        });

        const vars = {
          amount_usd_cents,
          pid
        };

        const q = `mutation(
          $pid:              ID!
          $amount_usd_cents: Int!
        ) {
          uut: playerDeposit(
            pid: $pid
            amount_usd_cents: $amount_usd_cents
          ) { balance_usd_cents }
        }`;
  
        const { data, errors } = await fix.graphql(q, vars);
        const { uut: _uut} = data;
  
        expect(errors).to.be.an('array').with.length(1);
        expect(_uut).to.be.null;
      });

      it('must be (strictly) positive', async function () {
        const initial_balance_usd_cents = 4567;
        const amount_usd_cents = -1234;

        const pid = await fix._player_create({
          balance_usd_cents: initial_balance_usd_cents
        });

        const vars = {
          amount_usd_cents,
          pid
        };

        const q = `mutation(
          $pid:              ID!
          $amount_usd_cents: Int!
        ) {
          uut: playerDeposit(
            pid: $pid
            amount_usd_cents: $amount_usd_cents
          ) { balance_usd_cents }
        }`;
  
        const { data, errors } = await fix.graphql(q, vars);
        const { uut: _uut} = data;
  
        expect(errors).to.be.an('array').with.length(1);
        expect(_uut).to.be.null;
      });
    });
  });

  context('invalid player', function () {
    it('player not exist', async function () {
      const pid = fix.random_id();
      const amount_usd_cents = 1234;

      const vars = {
        amount_usd_cents,
        pid
      }

      const q = `mutation(
        $pid:              ID!
        $amount_usd_cents: Int!
      ) {
        uut: playerDeposit(
          pid: $pid
          amount_usd_cents: $amount_usd_cents
        ) { pid }
      }`;

      const { data, errors } = await fix.graphql(q, vars);
      const { uut: _uut } = data;

      expect(errors).to.be.an('array').with.length(1);
      expect(_uut).to.be.null;
    });
  });
});


describe('mutation playerUpdate', function () {
  this.timeout(DEFAULT_TIMEOUT_MS);

  const fix = new Fixture();

  before(() => fix.before());
  after(() => fix.after());


  context('player exist', function () {
    it('field: lname', async function () {
      const lname = 'new_lname';

      const pid = await fix._player_create();

      const vars = {
        pid,
        lname
      };

      const q = `mutation(
        $pid:   ID!
        $lname: String
      ) {
        uut: playerUpdate(
          pid: $pid
          playerInput:{
            lname:  $lname
          }
        ) { pid }
      }`;

      await fix.graphql(q, vars, true);

      const _lname = await fix._player_get(pid, 'lname');
      expect(_lname).to.equal(lname);
    });


    it('field: is_active', async function () {
      const is_active = false;

      const pid = await fix._player_create();

      const vars = {
        pid,
        is_active
      };

      const q = `mutation(
        $pid:       ID!
        $is_active: Boolean
      ) {
        uut: playerUpdate(
          pid: $pid
          playerInput:{
            is_active:  $is_active
          }
        ) { pid }
      }`;

      await fix.graphql(q, vars, true);

      const _is_active = await fix._player_get(pid, 'is_active');
      expect(_is_active).to.equal(is_active);
    });


    it('resp user match', async function () {
      const lname = 'new_lname';

      const pid = await fix._player_create();

      const vars = {
        pid,
        lname
      };

      const q = `mutation(
        $pid:   ID!
        $lname: String
      ) {
        uut: playerUpdate(
          pid: $pid
          playerInput:{
            lname:  $lname
          }
        ) { pid }
      }`;

      const { data } = await fix.graphql(q, vars, true);

      const { uut: { pid: _pid } } = data;
      expect(_pid).to.equal(pid);
    });


    context('field: lname', function () {
      it('resp not stale', async function () {
        const lname = 'new_lname';

        const pid = await fix._player_create();

        const vars = {
          pid,
          lname
        };

        const q = `mutation(
          $pid:   ID!
          $lname: String
        ) {
          uut: playerUpdate(
            pid: $pid
            playerInput:{
              lname:  $lname
            }
          ) { lname }
        }`;

        const { data } = await fix.graphql(q, vars, true);

        const { uut: { lname: _lname } } = data;
        expect(_lname).to.equal(lname);
      });
    });


    context('field: is_active', function () {
      it('resp not stale', async function () {
        const is_active = false;

        const pid = await fix._player_create();

        const vars = {
          pid,
          is_active
        };

        const q = `mutation(
          $pid:       ID!
          $is_active: Boolean
        ) {
          uut: playerUpdate(
            pid: $pid
            playerInput:{
              is_active:  $is_active
            }
          ) { is_active }
        }`;

        const { data } = await fix.graphql(q, vars, true);  

        const { uut: { is_active: _is_active } } = data;
        expect(_is_active).to.equal(is_active);
      });
    });
  });


  context('player not exist', function () {
    it('resp null', async function () {
      const pid = fix.random_id();
      const lname = 'new_lname';

      const vars = {
        pid,
        lname
      };

      const q = `mutation(
        $pid:   ID!
        $lname: String
      ) {
        uut: playerUpdate(
          pid: $pid
          playerInput:{
            lname:  $lname
          }
        ) { pid }
      }`;

      const { data } = await fix.graphql(q, vars, true);
      const { uut: _uut } = data;

      expect(_uut).to.be.null;
    });
  });
});
