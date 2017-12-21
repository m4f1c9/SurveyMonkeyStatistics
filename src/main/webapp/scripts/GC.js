function createGCEditArea(id, div, chartsData) {
    div.addClass(chartsData.id.toString());
    div.append($(' <input class="chart-id" hidden type="text" value="' + id + '">'));
    div.append($('<h3>Имя графика</h3>'));
    div.append($(' <input class="chart-name" type="text" value="' + chartsData.chartName + '">'));
    div.append($('<h3>Вопросы</h3>'));
    let table = $('<table></table>');
    let tr1 = $('<tr></tr>');
    let tr2 = $('<tr></tr>');
    let tr3 = $('<tr class="questions"></tr>');
    tr1.append($('<td></td>'));
    tr2.append($('<td></td>'));
    tr3.append($('<td></td>'));
    let quest = [];
    chartsData.questionDetails.forEach(function (item, i, arr) {
        quest[i] = item.questionId;
        tr1.append($('<td><input class="col-name" type="text" value="' + item.name + '"></td>'));

        let surveys = $('.surveys-select').clone();
        surveys.removeClass('surveys-select');
        surveys.addClass('surveys-select-gbc');
        surveys.find('option[value=' + item.surveyId + ']').attr('selected', 'selected');
        tr2.append($('<td></td>').append(surveys));

        surveys.on('change', function () {

            let index = $(this).parent().index();
            let questions = $(this).parent().parent().next().children('td:eq(' + index + ')').find('select');
            $.ajax({
                url: "/MonkeyStatistics/api/questionsBySurveyId?id=" + $(this).find('option:selected').val(),
                dataType: "json",
                success: function (questionsData) {
                    questions.empty();
                    for (var i = 0; i < questionsData.length; i++) {
                        var t = questionsData[i];
                        questions.append('<option value="' + t.id + '">' + t.name + '</option>');
                    }
                    questions.change();
                }
            });
        });

        let question = $('<select  style="width: 300px" class="question"></select>'); //TODO remove style
        $.ajax({
            url: "/MonkeyStatistics/api/questionsBySurveyId?id=" + item.surveyId,
            dataType: "json",
            success: function (questionsData) {
                for (var i = 0; i < questionsData.length; i++) {
                    var t = questionsData[i];
                    question.append('<option value="' + t.id + '">' + t.name + '</option>');
                }
                question.find('option[value=' + item.questionId + ']').attr('selected', 'selected');
            }
        });

        question.on('change', function () {
            let index = $(this).parent().index();
            let choices = $(this).closest('table').find('.choices td:nth-child(' + (index + 1) + ')').find('select'); // +1 так как это CSS селектор
            choices.empty();

            let questionId = $(this).find('option:selected').val();

            $.ajax({
                url: "/MonkeyStatistics/api/answers?id=" + questionId,
                dataType: "json",
                success: function (questionsData) {
                    choices.empty();
                    choices.append('<option value="null">' + 'Вариант отсутствует' + '</option>');
                    for (var i = 0; i < questionsData.length; i++) {
                        var t = questionsData[i];
                        choices.append('<option value="' + t.id + '">' + t.name + '</option>');
                    }
                }
            });

        });

        tr3.append($('<td style="width: 300px"></td>').append(question)); //TODO remove style


    });
    table.append(tr1);
    table.append(tr2);
    table.append(tr3);

    chartsData.choiceGroups.forEach(function (item, i, arr) {
        let tr = $('<tr class="choices"></tr>');

        tr.append($('<td><input class="row-name" type="text" value="' + item.text + '"></td>'));

        item.choicesId.forEach(function (ID, i, arr) {
            let answers = $('<select  style="width: 300px" class="choice"></select>'); //TODO remove style
            answers.append('<option value="null">' + 'Вариант отсутствует' + '</option>');
            $.ajax({
                url: "/MonkeyStatistics/api/answers?id=" + quest[i],
                dataType: "json",
                success: function (questionsData) {

                    for (var i = 0; i < questionsData.length; i++) {
                        var t = questionsData[i];
                        answers.append('<option value="' + t.id + '">' + t.name + '</option>');
                    }
                    answers.find('option[value=' + ID + ']').attr('selected', 'selected');
                }
            });

            // tr.append($('<td>' + ID + '</td>'));
            tr.append($('<td></td>').append(answers));
        });

        table.append(tr);
    });


    div.append(table);
    div.append(createQuestionsCheckboxes(chartsData.questionOptions));
    div.append(createChartCheckboxes(chartsData.chartOptions));

    let buttons = createCommonQuestions();
    buttons.find('.save').on('click', saveGC);

    div.append(buttons);

    let chartDiv = $('<div class="chart"></div>');
    div.append($('<h3>Предпросмотр</h3>'));
    div.append(chartDiv);
    drawChart(chartDiv, id);

    buttons.append($('<button class="reDrawGC">Перерисовать</button>'))
    buttons.find('.reDrawGC').on('click', reDrawGC);

    buttons.append($('<button class="new-row">Новая строка</button>'))
    buttons.append($('<button class="new-column">Новый столбец</button>'))

    buttons.find('.new-row').on('click', newRow);
    buttons.find('.new-column').on('click', newColumn);

}

function newRow() {
    let table = $(this).closest('.edit-area').find('table');
    let questions = table.find('.questions');
    let choices = $('<tr class="choices"></tr>');


    choices.append($('<td><input class="row-name" type="text" value=""></td>'));

    for (let i = 1; i < questions.children().length; i++) {
        let answers = $('<select  style="width: 300px" class="choice"></select>'); //TODO remove style
        let td = $('<td></td>');
        answers.append('<option value="null">' + 'Вариант отсутствует' + '</option>');
        choices.append(td);

        $.ajax({
            url: "/MonkeyStatistics/api/answers?id=" + questions.find('td:eq(' + i + ')').find('option:selected').val(),
            dataType: "json",
            async: false, //TODO иначе не работает разобратся
            success: function (questionsData) {

                for (var i = 0; i < questionsData.length; i++) {
                    var t = questionsData[i];
                    answers.append('<option value="' + t.id + '">' + t.name + '</option>');
                }
                td.append(answers);
            }
        });


    }

    table.append(choices);


}

function newColumn() {
//!!!!!!!
    let table = $(this).closest('.edit-area').find('table:first');
    table.find('tr:nth-child(1)').append($('<td><input class="col-name" type="text" value=""></td>'));

    let surveys = $('.surveys-select').clone();
    surveys.removeClass('surveys-select');
    surveys.addClass('surveys-select-gbc');

    surveys.on('change', function () {
        let index = $(this).parent().index();
        let questions = $(this).parent().parent().next().children('td:eq(' + index + ')').find('select');
        $.ajax({
            url: "/MonkeyStatistics/api/questionsBySurveyId?id=" + $(this).find('option:selected').val(),
            dataType: "json",
            success: function (questionsData) {
                questions.empty();

                for (var i = 0; i < questionsData.length; i++) {
                    var t = questionsData[i];
                    questions.append('<option value="' + t.id + '">' + t.name + '</option>');
                }
                questions.change();
            }
        });
    });

    table.find('tr:nth-child(2)').append($('<td></td>').append(surveys));


    let question = $('<select  style="width: 300px" class="question"></select>'); //TODO remove style
    $.ajax({
        url: "/MonkeyStatistics/api/questionsBySurveyId?id=" + surveys.find('option:selected').val(),
        dataType: "json",
        success: function (questionsData) {
            for (var i = 0; i < questionsData.length; i++) {
                var t = questionsData[i];
                question.append('<option value="' + t.id + '">' + t.name + '</option>');
            }
        }
    });

    surveys.change();
    question.on('change', function () {
        let index = $(this).parent().index();
        let choices = $(this).closest('table').find('.choices td:nth-child(' + (index + 1) + ')').find('select'); // +1 так как это CSS селектор
        choices.empty();

        let questionId = $(this).find('option:selected').val();
        $.ajax({
            url: "/MonkeyStatistics/api/answers?id=" + questionId,
            dataType: "json",
            success: function (questionsData) {
                choices.empty();
                choices.append('<option value="null">' + 'Вариант отсутствует' + '</option>');
                for (var i = 0; i < questionsData.length; i++) {
                    var t = questionsData[i];
                    choices.append('<option value="' + t.id + '">' + t.name + '</option>');
                }
            }
        });

    });

    table.find('tr:nth-child(3)').append($('<td style="width: 300px"></td>').append(question)); //TODO remove style


    let answers = $('<td><select  style="width: 300px" class="choice"></select></td>');
    answers.find('select').prepend('<option value="null">' + 'Вариант отсутствует' + '</option>');

    table.find('.choices').each(function (index, element) {
        $(this).append(answers.clone());
    })


}


function saveGC() {
    let editArea = $(this).closest('.edit-area');

    let answer = collectGCData(editArea);

    $.ajax({
        type: "POST",
        contentType: 'application/json',
        url: "/MonkeyStatistics/api/saveChart",
        dataType: "json",
        async: false,
        data: JSON.stringify(answer),
        success: function (inputData) {
            drawChartById(editArea.find('.chart'), answer.id);

        },

        error: function (inputData) {
        }
    });
}

function reDrawGC(evt) {
    evt.preventDefault();
    let editArea = $(this).closest('.edit-area');
    let data = collectGCData(editArea);
    drawChartByData(editArea.find('.chart'), data);
}


function collectGCData(editArea) {


    let answer = {};
    answer.type = "GroupedByChoiceChart";
    answer.id = editArea.find('.chart-id').val();
    answer.chartName = editArea.find('.chart-name').val();
    answer.choiceGroups = [];
    answer.questionDetails = [];
    answer.chartOptions = {};
    answer.questionOptions = {};

    answer.questionOptions.withCustomChoice = editArea.find('.question-checkboxes').find('.custom-choice').is(':checked');
    answer.questionOptions.withNoChoice = editArea.find('.question-checkboxes').find('.no-choice').is(':checked');

    answer.chartOptions.useGradient = editArea.find('.gradient').is(':checked');
    if (editArea.find('.tooltip').is(':checked')) {
        answer.chartOptions.tooltip = 'FULL';
    }
    else {
        answer.chartOptions.tooltip = 'SHORT';
    }

    if (editArea.find('.annotation').is(':checked')) {
        answer.chartOptions.annotation = 'FULL';
    }
    else {
        answer.chartOptions.annotation = 'SHORT';
    }

    editArea.children('table').find('.col-name').each(function (index, element) {
        answer.questionDetails[index] = {};
        answer.questionDetails[index].questionOptions = {};
        answer.questionDetails[index].name = element.value;
    });


    editArea.find('.questions').find('option:selected').each(function (index, element) {
        answer.questionDetails[index].questionId = $(this).val();
    });

    editArea.find('.choices').each(function (rowIndex, element) {
        answer.choiceGroups[rowIndex] = {};
        answer.choiceGroups[rowIndex].text = $(this).find('.row-name').val();
        answer.choiceGroups[rowIndex].choicesId = [];

        $(this).find('.choice').each(function (columnIndex, element) {
            let value = $(this).find('option:selected').val();
            if (value === 'null') {
                answer.choiceGroups[rowIndex].choicesId[columnIndex] = null;
            }
            else {
                answer.choiceGroups[rowIndex].choicesId[columnIndex] = $(this).find('option:selected').val();
            }
        });
    });


    return answer;


}