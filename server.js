// ------------WEB SERVER----------------
var express = require('express');
var app = express();

app.set('view engine', 'ejs');
app.set('views', (__dirname+ '/views'));

app.use(express.static(__dirname +'/static'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

// -----------connect to Mongoose Database-------------
var mongoose =require('mongoose');

mongoose.connect('mongodb://localhost/memosSchema');

// Create Memo Schema
var MemoSchema = new mongoose.Schema({
	name: {type: String, required: true, trim:true},
	memo: {type: String, required: true, trim: true},
	// associate comments to memos
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref:'Comment'}],
	created_at: {type: Date, default: Date.now},
	updated_at: {type: Date, default: Date.now}
});
// save memo/message to database
mongoose.model('Memo', MemoSchema);
var Memo = mongoose.model('Memo');

// Create comment schema 
var CommentSchema = new mongoose.Schema({
	name: {type: String, required:true, trim:true},
	_Memo: { type: mongoose.Schema.Types.ObjectId, required: true, trim: true, ref:'Memo'},
	comment: {type: String, required: true, trim: true},
	created_at: {type: Date, default: Date.now},
	updated_at: {type: Date, default: Date.now}
});
// save comment to database
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');

// render data on index page
app.get('/', function(req,res){
	Memo.find({})
	.populate('comments')
	.exec(function(err, records){
	 return res.render('index', {memos: records});	
	})
})
// ------Post memos-----
app.post('/memos', function(req,res){
	console.log(req.body);
	// new memo instance
	var memoInstance=new Memo(req.body);
	// saves and call back 1st parameter
	memoInstance.save(function(err){
		res.redirect('/');
	});
});

// ------Post comments-----
app.post('/comments', function(req,res){
	console.log(req.body);
	// new comment instance 
	var commentInstance = new Comment(req.body);
	Memo.findOne({_id:req.body._Memo}, function(err,record){
		record.comments.push(commentInstance._id);
		record.save(function(){
			commentInstance.save(function(err){
				return res.redirect('/');
			})
		})
	})
});





app.listen(1337);

