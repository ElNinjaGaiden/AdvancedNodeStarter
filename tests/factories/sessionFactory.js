const { Buffer } = require('safe-buffer');
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = user => {
	// const id = '6146165c1a545657bc7b0d4b';
    const sessionObject = {
        passport: {
            user: user._id.toString()
        }
    };
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const sig = keygrip.sign( `session=${session}`);
	return { session, sig };
};