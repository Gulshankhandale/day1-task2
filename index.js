const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const PORT = 5000;

const uri = "mongodb+srv://admin:admin123@cluster0.xuwyjqe.mongodb.net/?retryWrites=true&w=majority"

const JWT_SECRET = 'sdfsfhshuwgerweytrtwtrtwggdg$4623273@ahsdsdgagdghdsdshdhdjh'

mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})

const app = express()

app.use(bodyParser.json())



app.post('/api/login', async (req, res) => {
	const { email, password } = req.body
	const user = await User.findOne({ email }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid email/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		return res.json({ status: 'OK', data: token })
	}

	res.json({ status: 'error', error: 'Invalid email/password' })
})

app.post('/api/register', async (req, res) => {
	const { username, email, address,city , password: plainTextPassword } = req.body

	if (!email || typeof email !== 'string') {
		return res.json({ status: 'error', error: 'Invalid email' })
	}

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password is small. password must be 6 characters'
		})
	}

	const password = await bcrypt.hash(plainTextPassword, 10)

	try {
		const response = await User.create({
			username,
			email,
			address,
			city,
			password
		})
		console.log('User created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			
			return res.json({ status: 'error', error: 'Email is already in use' })
		}
		throw error
	}

	res.json({ status: 'ok' })
})

app.listen(PORT, () => {
	console.log(`The server has started on ${PORT}`);
})
