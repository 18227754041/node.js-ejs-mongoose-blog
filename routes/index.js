
/*
 * GET home page.
 */
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _User = new Schema({
    username: String,
    password: String
});

var _Post = new Schema({
    username: String,
    post: String,
    time: String
});

var Usermodel = mongoose.model('User',_User);
var Postmodel = mongoose.model('Post',_Post);

module.exports = function(app) {
	app.get('/', function(req, res){
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Postmodel.find().skip((page-1)*6).limit(6).exec(function(err,posts){
            if(err){
                req.flash('error','error!');
                res.redirect('/');
            }
            res.render('index',{
                title: '首页',
                posts: posts,
                page: page,
                error: req.flash('error'),
                success: req.flash('success')
            });
        });
	});

	app.get('/reg', function(req, res){
		res.render('reg', {
			title: '用户注册',
			error: req.flash('error'),
			success: req.flash('success')
		});
	});

	app.get('/u/:user', function(req, res){
        var page = req.query.p ? parseInt(req.query.p) : 1;
        Postmodel.find({'username':  req.params.user}).skip((page-1)*6).limit(6).exec(function(err,posts){
            if(err){
                req.flash('error','error!');
                res.redirect('/');
            }
            res.render('user',{
                title: req.params.user,
                posts: posts,
                page: page,
                error: req.flash('error'),
                success: req.flash('success')
            });
        });
	});

    app.post('/post', function(req, res){
        user = req.session.user;

        if (req.body.post == ''){
            req.flash('error', '正文不能为空');
            return res.redirect('/u/'+user.username);
        }      


        var post = new Postmodel({
            username: user.username,
            post: req.body.post,
            time: new Date()
        });
        post.save(function(){
            req.flash('success','发表成功！');
            res.redirect('/u/'+user.username);
        });
    });
    
    app.post('/reg', function(req, res){
        if (req.body['password-repeat'] != req.body['password']) {
            req.flash('error', '两次输入的口令不一致!');
            return res.redirect('/reg');
        }     
        if (req.body.username == ''){
            req.flash('error', '用户名不能为空!');
            return res.redirect('/reg');
        }  
        if (req.body.password == ''){
            req.flash('error', '密码不能为空!');
            return res.redirect('/reg');
        } 

        Usermodel.find({'username': req.body.username},function(err,user){
            if(user[0]){
                req.flash('error', '用户名已存在!');
                return res.redirect('/reg');
            }

            var newUser = new Usermodel({
                username: req.body.username,
                password: req.body.password
            });
            newUser.save(function(){
                req.session.user = newUser;
                req.flash('success', '注册成功！');
                res.redirect('/');
            });    
        });
    }); 
    app.get('/login', function(req, res){
    	res.render('login',{
    		title: '用户登入',
			error: req.flash('error'),
			success: req.flash('success')
    	})
    });
    app.post('/login', function(req, res){

        if (req.body.username == ''){
            req.flash('error', '用户名不能为空!');
            return res.redirect('/login');
        }  
        if (req.body.password == ''){
            req.flash('error', '密码不能为空!');
            return res.redirect('/login');
        } 


        var username = req.body.username;
        var password = req.body.password;
        Usermodel.find({'username': username},function(err,user){
            if(err){
                req.flash('error', '登录失败!');
                res.redirect('/login');
            }
            if(!user[0]){
                req.flash('error', '用户不存在!');
                return res.redirect('/login');
            }
            if(user[0].password == password){
                req.session.user = user[0];
                req.flash('success', '登录成功!');
                res.redirect('/u/'+username);
            }else{
                req.flash('error', '密码错误!');
                res.redirect('/login');
            }
        });
    });

    app.get('/logout', function(req, res){
    	req.session.user = null;
    	req.flash('success', '登出成功！');
    	res.redirect('/');
    });

    app.get('/delete/:time', function(req, res){
        Postmodel.remove({'time': req.params.time},function(err){
            req.flash('success', '删除成功!');
            res.redirect('back');
        });
    });

    app.get('/update/:time', function(req, res){
        Postmodel.find({'time': req.params.time},function(err,post){
            res.render('update', {
                title: '修改',
                post: post[0],
                error: req.flash('error'),
                success: req.flash('success')
            });
        });
    });

    app.post('/update/:time', function(req, res){
        Postmodel.update({'time': req.params.time},{'post': req.body.post},function(err){
            req.flash('success','修改成功！');
            res.redirect('/u/'+req.session.user.username);
        });
    });

    app.post('/', function(req, res){
        Postmodel.find({'username': req.body.search}, function(err,posts){
            if(err){
                req.flash('error','error!');
                res.redirect('/');
            }
            res.render('index',{
                title: '首页',
                posts: posts,
                error: req.flash('error'),
                success: req.flash('success')
            });
        });
    });
};