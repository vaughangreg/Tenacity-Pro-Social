RandomSequence = function (len){
	var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var ret = "";
	for (var i = 0; i < len; i++){
		var chr = Math.floor(Math.random() * chars.length);
		ret += chars.substring(chr, chr+1);
	}
	return ret;
};
GenerateUserID = function(){
	var len = 4;
	return RandomSequence(len) + RandomSequence(len) + "-" + RandomSequence(len) + "-" + RandomSequence(len) + "-" + RandomSequence(len) + RandomSequence(len) + RandomSequence(len) + RandomSequence(len);
}

GeneratePairID = function(){
	var len = 6;
	return RandomSequence(len) + RandomSequence(len) + "-" + RandomSequence(len) + "-" + RandomSequence(len);

}

exports.RandomSequence = RandomSequence;
exports.GenerateUserID = GenerateUserID;
exports.GeneratePairID = GeneratePairID;