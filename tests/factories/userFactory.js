const moongose = require('mongoose');
const User = moongose.model('User');

module.exports = () => {
	//_id: '6146165c1a545657bc7b0d4b'
	return new User({}).save();
};