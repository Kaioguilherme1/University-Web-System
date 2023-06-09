
const {Course, User, Registration} = require('../models/index');
const Category = require('../models/categories_model');
const {Op} = require("sequelize");
const TokenController = require("../middleware/AuthToken");
const {hasPermissionAdmin, hasPermissionUser} = require("../middleware/roles");
const {requestLogger} = require("../config/logger");
const {Certificate} = require("../models");

async function createCourse(token ,data) {
    if (hasPermissionAdmin(token)){
        try {
            let course = await Course.create(data);
            return {
                error: false,
                message: 'Curso criado com sucesso',
                course: course
            }
        }catch (error) {
            requestLogger.error('Erro ao criar curso: ' + error.message);
            return {
                error: true,
                message: 'Erro ao criar curso' + data.name,
                error_message: error.message,
            }
        }
    }else {
        requestLogger.error('tentaiva de criar curso sem permissão');
        return {
            error: true,
            message: 'Você não tem permissão para criar um curso',
        }
    }
}

async function updateCourse(id, token, data) {
    if (await hasPermissionAdmin(token)){
        try {
            let course = await Course.update(data, {
                where: {
                    id: id
                }
            });
            return {
                error: false,
                message: 'Curso atualizado com sucesso',
                course: course
            }
        }catch (error) {
            requestLogger.error('Erro ao atualizar curso: ' + error.message);
            return {
                error: true,
                message: 'Erro ao atualizar curso' + data.name,
                error_message: error.message,
            }
        }
    }else {
        requestLogger.error('tentaiva de atualizar curso sem permissão');
        return {
            error: true,
            message: 'Você não tem permissão para atualizar um curso',
        }
    }

}

async function getCourses(token, consult) {
  let { all, id, name, tags, category, participants } = consult;

  if (participants && !await hasPermissionAdmin(token)) {
    requestLogger.error('Tentativa de acessar cursos sem permissão de administrador');
    return {
      error: true,
      message: 'Você não tem permissão para acessar os cursos'
    };
  }

  try {
    const whereClause = all
      ? {} // Se "all" for true, não aplicamos nenhum filtro
      : {
          [Op.and]: [
            id ? { id } : {},
            name ? { name } : {},
            category ? { '$Category.name$': category } : {},
            (tags && tags.length > 0) ? { tags: { [Op.contains]: tags } } : {}
          ]
        };

    let includeClause = [
    {
      model: Category,
      attributes: ['name', 'description']
    }
    ];

   let courses = await Course.findAll({
      where: whereClause,
      include: includeClause
    });

    let coursesList = [];
    try {
      for (let course of courses) {
        const participantsList = await Registration.findAll({
          where: {
            Course_id: course.id
          },
          include: [
            {
              model: User,
              attributes: ['id' ,'name']
            },
            {
              model: Certificate,
              attributes: ["validate_code"]
            }
          ],
        });

        if (participants) {
          coursesList.push({
              course,
              participants: participantsList.map(participant => participant)
          });

        } else {
            coursesList.push({
              course,
              participants: participantsList.map(participant => participant.User.id)
          });
        }
      }
    } catch (error) {
      requestLogger.error('Erro ao buscar participantes: ' + error.message);
      return {
        error: true,
        message: 'Erro ao buscar participantes',
        error_message: error.message
      };
    }

    requestLogger.info(`${courses.length} Cursos encontrados`);
    return {
      error: false,
      message: `${courses.length} Cursos encontrados`,
      courses: coursesList
    };
  } catch (error) {
    requestLogger.error('Erro ao buscar cursos: ' + error.message);
    return {
      error: true,
      message: 'Erro ao buscar cursos',
      error_message: error.message
    };
  }
}

async function deleteCourse(id, token) {
    if (await hasPermissionAdmin(token)){
        try {
            let course = await Course.destroy({
                where: {
                    id: id
                }
            });
            return {
                error: false,
                message: `Curso deletado com sucesso`,
                course: course
            }
        }catch (error) {
            requestLogger.error('Erro ao deletar curso: ' + error.message);
            return {
                error: true,
                message: 'Erro ao deletar curso',
                error_message: error.message,
            }
        }
    }else {
        requestLogger.error('tentaiva de deletar curso sem permissão');
        return {
            error: true,
            message: 'Você não tem permissão para deletar um curso',
        }
    }
}

module.exports = {
    createCourse,
    updateCourse,
    getCourses,
    deleteCourse
}