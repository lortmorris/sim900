"use strict";
/**
 * SIM900 lib
 * @constructor
 */

const ports = require("./ports");
const debug = require("debug")("sim900");
const EventEmitter = require('events');


class MyEvents extends EventEmitter {
}

const Events = new MyEvents();

class SIM900 {
    constructor(port, options) {

        debug("constructor: " + port + " : " + JSON.stringify(options));

        var self = this;
        if (!port)  throw "invalid port";
        this.options = options;
        this._ready = false;

        self.port = new ports(port, options);

        self.port.ready()
            .then(()=> {
                debug("port initialized");
                return self.init();
            })
            .then((data)=> {
                debug("resolving: " + data);
                Events.emit("ready");
                self._ready = true;
            })
            .catch((err)=> {
                debug(err);
            });

    }


    ready() {
        var self = this;
        return new Promise((resolve, reject)=> {
            if (self._ready) return resolve();

            Events.once("ready", ()=> {
                resolve();
            })

        })
    }

    getICCID() {
        var self = this;
        debug("getICCID called");
        return new Promise((resolve, reject)=> {
            self.port.write('AT+CCID')
                .then(resolve)
                .catch(reject);
        });
    }


    sms(msg, number) {
        var self = this;

        return new Promise((resolve, reject)=> {
            self.port.write("AT", 500)
                .then((r)=> {
                    debug(".msg: ", r);
                    return self.port.write("AT+CMGF=1", 500);
                })
                .then((r)=> {
                    debug(".msg: ", r);
                    return self.port.write('AT+CMGS="' + number + '"', 500);
                })
                .then((r)=> {
                    debug(".msg: ", r);
                    return self.port.write(msg + String.fromCharCode(parseInt("1A", 16)), 10000);
                })
                .then(resolve)
                .catch(reject);


        });
    }


    initializeGPRS(apn, user, pass) {
        var self = this;
        debug("initializeGPRS called");
        return new Promise((resolve, reject)=> {
            self.port.write("AT+SAPBR=3,1,\"APN\",\"" + apn + "\"", 500)
                .then((r)=> {
                    debug("GPRS: ", r);
                    return self.port.write("AT+SAPBR=3,1,\"USER\",\"" + user + "\"", 500);
                })
                .then((r)=> {
                    debug("GPRS: ", r);
                    return self.port.write("AT+SAPBR=3,1,\"PWD\",\"" + pass + "\"", 500);
                })
                .then((r)=> {
                    debug("GPRS: ", r);
                    return self.port.write("AT+SAPBR=1,1");
                })
                .then(resolve)
                .catch(reject);

        });

    }


    status() {
        var self = this;
        debug("status called");
        return new Promise((resolve, reject)=> {
            self.port.write('AT+CREG?')
                .then(resolve)
                .catch(reject);
        })

    }


    getSignalStrength() {
        var self = this;
        debug("getSignalStrength called");
        return new Promise((resolve, reject)=> {
            self.port.write('AT+CSQ')
                .then(resolve)
                .catch(reject);
        });

    }


    httpInit() {
        var self = this;
        debug('Initializing HTTP service');
        return new Promise((resolve, reject)=> {
            self.port.write('AT+HTTPINIT')
                .then(resolve)
                .catch(reject);
        });

    }


    initGPRS() {
        var self = this;
        return new Promise((resolve, reject)=> {
            self.port.write('AT+SAPBR=1,1')
                .then(resolve)
                .catch(reject);
        });

    }


    getIMSI() {
        var self = this;
        return new Promise((resolve, reject)=> {
            self.port.write("AT+CIMI")
                .then(resolve)
                .catch(reject);
        });

    }

;


    init() {
        var self = this;
        debug("init called");
        return new Promise((resolve, reject)=> {
            self.port.write("AT")
                .then((result)=> {
                    debug("AT> ", result);
                    return self.port.write("AT+SAPBR=2,1");
                })
                .then(resolve)
                .catch(reject)
        });
    }//end init
}


module.exports = SIM900;