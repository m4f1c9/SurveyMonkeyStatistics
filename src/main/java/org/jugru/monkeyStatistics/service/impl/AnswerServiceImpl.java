package org.jugru.monkeyStatistics.service.impl;

import java.util.List;
import org.jugru.monkeyService.model.Answer;
import org.jugru.monkeyStatistics.repository.AnswerRepository;
import org.jugru.monkeyStatistics.service.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnswerServiceImpl implements AnswerService {

    @Autowired
    private AnswerRepository answerRepository;

    @Override
    public Answer save(Answer answer) {
        return answerRepository.save(answer);
    }

    @Override
    public Answer get(long id) {
        return answerRepository.findOne(id);
    }

    @Override
    public void delete(Answer entity) {
        answerRepository.delete(entity);
    }

    @Override
    public List<Answer> getAll() {
        return answerRepository.findAll();
    }

    @Override
    public List<Answer> getByOther_id(long id) {
        return answerRepository.findAnswerByOther_id(id);
    }

    @Override
    public List<Answer> getByChoice_id(long choice_id) {
        return answerRepository.findAnswerByChoice_id(choice_id);
    }

    @Override
    public List<Answer> getByRow_id(long row_id) {
        return answerRepository.findAnswerByRow_id(row_id);
    }

}
