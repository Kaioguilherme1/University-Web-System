const express = require("express");
const registrationController = require("../controllers/RegistrationController");
const certificateController = require("../controllers/CertificateController");
const { body, validationResult } = require('express-validator');
const { token } = require("morgan");

const router = express.Router();

//--------------------------------------------------------------criar--------------------------------------------------------------
router.post('/create', [
  body('user_id').notEmpty().withMessage('O campo user_id é obrigatório'),
  body('course_id').notEmpty().withMessage('O campo course_id é obrigatório'),
], async (req, res) => {
  const {user_id, course_id} = req.body;
  let token = req.headers.authorization;
  const registration = await registrationController.createRegistration(token, {
    user_id,
    course_id,
  });
  res.json({ registration });
});

//--------------------------------------------------------------listar--------------------------------------------------------------

router.post('/get', async (req, res) => {
  let token = req.headers.authorization;
  let consult = req.body;
  const registrations = await registrationController.getRegistrations(token, consult);
  res.json(registrations);
});

//-------------------------------------------------------------gerar certificado--------------------------------------------------------------

router.post('/certificate', async (req, res) => {
  let token = req.headers.authorization;
  let consult = req.body;
  const registrations = await certificateController.createCertificate(token, consult);
  res.json(registrations);
});

//--------------------------------------------------------------Validar certificado--------------------------------------------------------------
router.post('/certificate/validate', async (req, res) => {
  let consult = req.body;
  const registrations = await certificateController.validate(consult);
  res.json(registrations);
});

//--------------------------------------------------------------atualizar--------------------------------------------------------------

router.put('/:id', async (req, res) => {
  let token = req.headers.authorization;
  let id = req.params.id;
  let data = req.body;
  const registration = await registrationController.updateRegistration(id, token, data);
  res.json(registration);
});

//--------------------------------------------------------------deletar--------------------------------------------------------------

router.delete('/:id', async (req, res) => {
  let token = req.headers.authorization;
  let id = req.params.id;
  const registration = await registrationController.deleteRegistration(id, token);
  res.json(registration);
});

module.exports = router;
