import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';
import { SurveyRepository } from '../repositories/SurveyRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UsersRepository } from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';
import { SurveyUser } from '../models/SurveyUser';

export class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveyRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({
            email
        });

        if (!user) {
            return response.status(400).json({
                error: 'User does not exists',
            });
        }

        const survey = await surveysRepository.findOne({
            id: survey_id
        });

        if (!survey) {
            return response.status(400).json({
                error: 'Survey does not exists',
            });
        }

        let surveyUser = await surveysUsersRepository.findOne({
            where: { user_id: user.id, survey_id: survey.id, },
            relations: ['user', 'survey'],
        });

        if (!surveyUser) {
            surveyUser = surveysUsersRepository.create({
                user_id: user.id,
                survey_id: survey_id,
            })

            await surveysUsersRepository.save(surveyUser);
        }

        const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');
        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            user_id: user.id,
            link: process.env.URL_MAIL,
        };

        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);
    }
}