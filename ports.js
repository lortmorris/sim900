const SerialPort = require('serialport');
const debug = require("debug")("sim900:ports");
const EventEmitter = require('events');


class MyEvents extends EventEmitter {
}
const Events = new MyEvents();


class ports {
    constructor(port, options) {

        debug("ports instanced: " + port + " : " + JSON.stringify(options));

        var self = this;

        this.options = options || {};

        this.options.baudRate = 57600;
        this.options.dataBits = 8;
        this.options.parity = "none";
        this.options.stopBits = 1;
        //this.options.parser =  SerialPort.parsers.readline('\r');
        //this.options.parser =  SerialPort.parsers.byteDelimiter(['14', '10']);


        this.data = null;
        this.on =
            this._ready = false;

        this.port = new SerialPort.SerialPort(port, self.options, (err)=> {
            debug("new SerialPort cb called");
            if (err) {
                debug("Error: " + err);
                self._ready = false;
            }
            else {

                debug("adding listeners");
                self.port.on('error', (err)=> {
                    debug(err.message);
                });

                self.port.on('open', ()=> {
                    debug("port opened");

                });

                self.port.on('data', (data)=> {
                    data = data.toString();
                    debug("INPUT> "+ data);
                    self.data += data;
                });

                Events.emit("ready");
                self._ready = true;

            }//end else

        });


    }//end constructor

    ready() {
        var self = this;
        debug("ready called");
        return new Promise((resolve, reject)=> {
            if (self._ready) return resolve();

            Events.once("ready", ()=> {
                resolve();
            });

        });
    }

    list() {
        var self = this;
        return new Promise((resolve, reject)=> {
            SerialPort.list((err, list)=> {
                err ? reject(err) : resolve(list);
            });
        });
    }//end list


    write(str, wait) {
        var self = this;
        var wait = wait || 1000;

        debug("write: " + str + "  : " + wait);

        str = str + "\r";
        self.data = "";

        return new Promise((resolve, reject)=> {
            self.port.write(str, (err)=> {
                err ? reject(err) : setTimeout(()=> {
                    resolve(self.data);
                }, wait)
            });
        });
    }//end write
}


module.exports = ports;