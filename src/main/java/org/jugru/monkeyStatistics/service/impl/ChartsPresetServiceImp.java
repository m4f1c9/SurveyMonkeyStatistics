package org.jugru.monkeyStatistics.service.impl;

import org.jugru.monkeyStatistics.model.chart.*;
import org.jugru.monkeyStatistics.repository.ChartsPresetRepository;
import org.jugru.monkeyStatistics.service.ChartService;
import org.jugru.monkeyStatistics.service.ChartsPresetService;
import org.jugru.monkeyStatistics.util.IdNamePair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

@Transactional
@Service
public class ChartsPresetServiceImp implements ChartsPresetService {

    private Logger logger = LoggerFactory.getLogger(ChartsPresetService.class);

    @Autowired
    ChartsPresetRepository chartsPresetRepository;

    @Autowired
    ChartsPresetService chartsPresetService;

    @Autowired
    ChartService chartService;

    @Override
    public ChartsPreset save(ChartsPreset t) {
        return chartsPresetRepository.save(t);
    }


    @Override
    public ChartsPreset get(long id) {
        return chartsPresetRepository.findOne(id);
    }

    @Override
    public void delete(ChartsPreset t) {
        chartsPresetRepository.delete(t);
    }

    @Override
    public List<ChartsPreset> getAll() {
        return chartsPresetRepository.findAll();
    }


    @Override
    public List<Long> getChartsIdByPresetId(Long id) {
        List<Long> answer = new LinkedList<>();
        get(id).getCharts().forEach((t) -> {
            answer.add(t.getId());
        });
        return answer;
    }


    @Override //TODO убрать проверку на null
    public List<IdNamePair> getIdNamePairsOfChartsByPresetId(Long id) {
        List<IdNamePair> answer = new LinkedList<>();

        get(id).getCharts().forEach((t) -> {
            if (t != null) {
                answer.add(new IdNamePair(t.getId(), t.getChartName()));
            }
        });
        return answer;
    }


    @Override
    public Chart createChart(Long id, String type) {
        Chart chart;
        if ("GC".equals(type)) {
            chart = new GroupedByChoiceChart(new QuestionOptions());
        } else if ("U".equals(type)) {
            chart = new UngroupedCharts();
        } else {
            chart = new CrossGroupingChart(new QuestionOptions(), new QuestionOptions());
        }
        chart.setChartOptions(new ChartOptions());
        chart.setChartName("");
        chart = chartService.save(chart);
        ChartsPreset preset = chartsPresetService.get(id);
        preset.addChart(chart);

        return chart;
    }

    @Override
    public List<IdNamePair> getIdNamePairOfPresets() {
        List<ChartsPreset> presets = chartsPresetService.getAll();
        List<IdNamePair> pairs = new ArrayList<>();
        presets.forEach((t) -> {
            pairs.add(new IdNamePair(t.getId(), t.getName()));
        });
        return pairs;
    }

    @Override
    public void rename(Long id, String name) {
        ChartsPreset preset = chartsPresetService.get(id);
        preset.setName(name);
        chartsPresetService.save(preset);
    }
}
