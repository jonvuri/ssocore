var _ = require('lodash')
var consolidate = require('consolidate')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var flash = require('connect-flash')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var express = require('express')
var app = express()


var PORT = 8000


var users = [
	{ id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' },
	{ id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
]


passport.serializeUser(function (user, done) {
	done(null, user.id)
})

passport.deserializeUser(function (id, done) {
	var user = _.find(users, {id: id})

	if (user) {
		done(null, user)
	} else {
		done(new Error('User ' + id + ' does not exist'))
	}
})

passport.use(new LocalStrategy(
	function (username, password, done) {
		var user = _.find(users, {username: username})
		
		if (!user || user.password !== password) {
			return done(null, false, { message: 'Invalid username or password' })
		} else {
			return done(null, user)
		}
	}
))


function authenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next()
	} else {
		res.redirect('/login')
	}
}


app.engine('html', consolidate.lodash)
app.set('view engine', 'html')
app.set('views', __dirname)


app.use(cookieParser())
app.use(session({ secret: 'dont tell anyone' }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())


// Expects query parameter 'returnTo' indicating redirect URL upon successful login
app.get('/login', function (req, res) {
	req.flash('returnTo', req.query.returnTo)
	res.render('login', { message: req.flash('error') })
})

app.post('/login',
	bodyParser(),
	passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
	function (req, res) {
		res.redirect(req.flash('returnTo'))
	}
)

app.get('/auth', function (req, res) {
	if (req.isAuthenticated()) {
		res.send(req.user)
	} else {
		res.send(401)
	}
})


var server = app.listen(PORT, function () {
	console.log('Listening on port %d', server.address().port)
})
