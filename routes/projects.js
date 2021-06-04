var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const auth = require('../auth')

router.get('/', async function(req, res, next) {
    const user = auth.getUser(req)
    if (!user) return res.send('You are not logged in')

    const criteria = {}
    if (req.query.leader === 'true') criteria.leader = user
    else criteria.participants = user
    if (req.query.archive === 'true') criteria.archived = true
    else criteria.archived = null

    const data = await mongoose.model('Project').find(criteria)
    res.render('list-projects', {projects: data, isLeader: criteria.leader || false});
});

router.get('/json', async function(req, res, next) {
    const data = await mongoose.model('Project').find()
    res.send(JSON.stringify(data))
});


router.get('/add-member/:id', async function(req, res, next) {
    const users = await mongoose.model('User').find()
    res.render('add-member', { project: {id: req.params.id}, users });
});

router.post('/add-member', async function(req, res, next) {
    const project = await mongoose.model('Project').findById(req.body.id)
    project.participants = req.body.member
    await project.save()
    res.redirect('/projects?leader=true&archive=false');
});

router.get('/create', function(req, res, next) {
    res.render('single-project', { project: {members: []} });
});

router.get('/edit/:id', async function(req, res, next) {
    const user = auth.getUser(req)
    if (!user) return res.send('You are not logged in')

    const single = await mongoose.model('Project')
        .findById(req.params.id)
        .populate('participants')
        .populate('leader')
        .exec()

    const isLeader = single.leader.id === user
    res.render('single-project', {project: single, isLeader});
});

router.get('/delete/:id', async function(req, res, next) {
    const single = await mongoose.model('Project').deleteOne({ _id: req.params.id })
    res.redirect('/projects?leader=true&archive=false');
});

router.get('/archive/:id', async function(req, res, next) {
    const doc = await mongoose.model('Project').findById(req.params.id)
    doc.archived = true
    await doc.save()
    res.redirect('/projects?leader=true&archive=false');
});

router.post('/', async function(req, res, next) {
    const user = auth.getUser(req)
    if (!user) return res.send('You are not logged in')
    delete req.body.leader

    if (req.body.id) {
        const doc = await mongoose.model('Project').findById(req.body.id)
        if (doc.leader && doc.leader.id === user) Object.assign(doc, req.body)
        else doc.workdone = req.body.workdone
        await doc.save()
    } else {
        await mongoose.model('Project').create({
            ...req.body,
            leader: user
        })
    }

    res.redirect('/projects?leader=true&archive=false')
});

module.exports = router;
