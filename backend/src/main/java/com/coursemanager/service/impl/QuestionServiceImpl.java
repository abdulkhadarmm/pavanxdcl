package com.coursemanager.service.impl;

import com.coursemanager.dto.request.QuestionRequest;
import com.coursemanager.dto.response.QuestionResponse;
import com.coursemanager.entity.Module;
import com.coursemanager.entity.Question;
import com.coursemanager.exception.ResourceNotFoundException;
import com.coursemanager.mapper.QuestionMapper;
import com.coursemanager.repository.ModuleRepository;
import com.coursemanager.repository.QuestionRepository;
import com.coursemanager.service.QuestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuestionServiceImpl implements QuestionService {

    private static final Logger log = LoggerFactory.getLogger(QuestionServiceImpl.class);

    private final QuestionRepository questionRepository;
    private final ModuleRepository moduleRepository;

    public QuestionServiceImpl(QuestionRepository questionRepository, ModuleRepository moduleRepository) {
        this.questionRepository = questionRepository;
        this.moduleRepository = moduleRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> getActiveQuestionsByTopic(Long topicId) {
        log.info("Fetching active questions for topic ID: {}", topicId);
        if (!moduleRepository.existsById(topicId)) {
            throw new ResourceNotFoundException("Topic not found with id: " + topicId);
        }
        return questionRepository.findByModuleIdAndDeletedFalseOrderByDisplayOrderAsc(topicId).stream()
                .map(QuestionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> getDeletedQuestionsByTopic(Long topicId) {
        log.info("Fetching deleted questions for topic ID: {}", topicId);
        if (!moduleRepository.existsById(topicId)) {
            throw new ResourceNotFoundException("Topic not found with id: " + topicId);
        }
        return questionRepository.findByModuleIdAndDeletedTrueOrderByDisplayOrderAsc(topicId).stream()
                .map(QuestionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(Long id) {
        log.info("Fetching question with ID: {}", id);
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return QuestionMapper.toResponse(question);
    }

    @Override
    public QuestionResponse createQuestion(Long topicId, QuestionRequest request) {
        log.info("Creating a new question under topic ID: {}", topicId);
        Module topic = moduleRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + topicId));
        Question question = QuestionMapper.toEntity(request);
        question.setModule(topic);
        int maxOrder = questionRepository.findMaxDisplayOrderByModuleId(topicId);
        question.setDisplayOrder(maxOrder + 1);
        Question savedQuestion = questionRepository.save(question);
        return QuestionMapper.toResponse(savedQuestion);
    }

    @Override
    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        log.info("Updating question with ID: {}", id);
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        QuestionMapper.updateEntity(request, question);
        Question updatedQuestion = questionRepository.save(question);
        return QuestionMapper.toResponse(updatedQuestion);
    }

    @Override
    public void softDeleteQuestion(Long id) {
        log.info("Soft deleting question with ID: {}", id);
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        question.setDeleted(true);
        questionRepository.save(question);
    }

    @Override
    public void restoreQuestion(Long id) {
        log.info("Restoring question with ID: {}", id);
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        question.setDeleted(false);
        questionRepository.save(question);
    }

    @Override
    public void reorderQuestions(List<Long> orderedIds) {
        log.info("Reordering questions with ID sequence: {}", orderedIds);
        for (int i = 0; i < orderedIds.size(); i++) {
            Long id = orderedIds.get(i);
            Optional<Question> questionOpt = questionRepository.findById(id);
            if (questionOpt.isPresent()) {
                Question question = questionOpt.get();
                question.setDisplayOrder(i);
                questionRepository.save(question);
            } else {
                log.warn("Reorder request: Question with ID {} not found", id);
            }
        }
    }
}
