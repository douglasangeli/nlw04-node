import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { Survey } from '../models/Survey';
import { SurveyRepository } from '../repositories/SurveyRepository';

export class SurveyController {
    async create(request: Request, response: Response<Survey>): Promise<Response<Survey>> {
        const { title, description } = request.body;

        const surveyRepository = getCustomRepository(SurveyRepository);

        const survey = surveyRepository.create({
            title,
            description
        });

        await surveyRepository.save(survey);
        return response.status(201).json(survey);
    }

    async show(_: Request, response: Response<Survey[]>): Promise<Response<Survey[]>> {
        const surveyRepository = getCustomRepository(SurveyRepository);

        const all = await surveyRepository.find();

        return response.json(all);
    }
}