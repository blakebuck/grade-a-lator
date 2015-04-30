var newCat = "<fieldset>\n    <legend><span class=\'text-danger deleteCat pull-right\'>Remove</span></legend>\n    <table>\n        <tr>\n            <th>Item Name</th>\n            <th>Grade</th>\n        </tr>\n        <tr>\n            <td>\n                <input class=\"itemName\">\n            </td>\n            <td>\n                <input class=\"itemValue\">\n            </td>\n        </tr>\n        <tr>\n            <td colspan=\'2\' class=\'text-center\'>\n                <br>\n                <button type=\'button\' class=\"addItem btn btn-primary\">Add Graded Item</button>\n            </td>\n        </tr>\n    </table>\n</fieldset>";
var newItem = "<tr>\n    <td>\n        <input class=\"itemName\">\n    </td>\n    <td>\n        <input class=\"itemValue\">\n    </td>\n</tr>";

var course = {
    categories: [],
    percentageTotal: 0
};

$(function(){
    $("#addCat").click(function(){

        var categoryName = $("#catName").val();

        if (!categoryName || categoryName.length <= 0){
            modal("A name for the category is required.");
            return;
        }

        // Prevent duplicate category
        if (typeof course.categories[categoryName] !== "undefined"){
            modal("Duplicate category names are not allowed.");
            return;
        }

        var percent = parseFloat($("#catPercent").val());

        if (isNaN(percent)){
            modal("A valid percent is required.");
            return;
        }

        // Prevent percentage over 100
        if ((course.percentageTotal + percent) > 100){
            modal("The total percentage for all categories can not be greater than 100%.");
            return;
        }

        // Store percentage
        course.categories[categoryName] = percent;
        course.percentageTotal += percent;

        var category = $(newCat);
        category.find("legend").prepend(categoryName + " " + percent + "%");
        category.find("input").attr("data-value", categoryName);
        category.find(".deleteCat").attr("data-value", categoryName);
        category.find("button").attr("data-value", categoryName);
        $("#catContainer").append(category);
        bindAddItem();
        bindDeleteCat();

        $("#catName").val("");
        $("#catPercent").val("");
    });
    $("#doTheMath").click(doTheMath);
});

function bindAddItem(){
    var addItemBtn = $(".addItem");
    addItemBtn.unbind("click");
    addItemBtn.click(function(){
        var item = $(newItem);
        item.find("input").attr("data-value", $(this).attr("data-value"));
        $(this).closest("tr").before(item);
    });
}

function bindDeleteCat(){
    var addItemBtn = $(".deleteCat");
    addItemBtn.unbind("click");
    addItemBtn.click(function(){
        var catName = $(this).attr("data-value");
        course.percentageTotal -= course.categories[catName];
        delete course.categories[catName];
        $(this).closest("fieldset").remove();
    });
}

function modal(message){
    $(".modal-body").html(message);

    $('.modal').modal('show');
}

function doTheMath(){
    var calculation = {
        percentageTotal: course.percentageTotal
    };

    // Calculate Average for Each Category
    for (var key in course.categories) {
        if (course.categories.hasOwnProperty(key)) {
            calculation[key] = {
                average: 0,
                itemCount: 0,
                percentage: course.categories[key]
            };
            var numItems = 0;
            $(".itemValue[data-value='" + key + "']").each(function(){
                var itemValue = parseFloat($(this).val());
                if (!isNaN(itemValue)){
                    calculation[key].average += itemValue;
                    numItems++;
                }
            });
            if (numItems > 0){
                calculation[key].itemCount = numItems;
                calculation[key].average = calculation[key].average / numItems;
            }
        }
    }

    // Eliminate empty categories
    for (key in calculation) {
        if (calculation.hasOwnProperty(key)) {
            if (calculation[key].itemCount == 0){
                calculation.percentageTotal -= calculation[key].percentage;
                calculation[key].percentage = 0;
            }
        }
    }

    var points = 0;

    // Adjust overall percentages & calculate total points
    for (key in calculation) {
        if (calculation.hasOwnProperty(key) && key != "percentageTotal") {
            calculation[key].percentage = calculation[key].percentage / calculation.percentageTotal;
            points += calculation[key].percentage * calculation[key].average;
            console.log(key + " " + calculation[key].percentage);
        }
    }

    var percentDiff = (1 - (calculation.percentageTotal / 100)) * 100;

    if (percentDiff == 0){
        // Don't show average needed
    }
    else {
        var a = Math.ceil(((90 - points * (calculation.percentageTotal/100)) / percentDiff) * 100);
        var b = Math.ceil(((80 - points * (calculation.percentageTotal/100)) / percentDiff) * 100);
        var c = Math.ceil(((70 - points * (calculation.percentageTotal/100)) / percentDiff) * 100);
        var d = Math.ceil(((60 - points * (calculation.percentageTotal/100)) / percentDiff) * 100);
    }

    a = a >= 0 ? a : 0;
    b = b >= 0 ? b : 0;
    c = c >= 0 ? c : 0;
    d = d >= 0 ? d : 0;

    // Assign letter grade
    //var grade = "";
    //if (points >= 90) grade = "A";
    //else if (points >= 80) grade = "B";
    //else if (points >= 70) grade = "C";
    //else if (points >= 60) grade = "D";
    //else grade = "F";

    points = points - points.toFixed(1) == 0 ? points : points.toFixed(1);

    var message = "Your current grade is <strong>" + points + "%</strong>";
    message = calculation.percentageTotal < 100 ? message + "<br><br> You will need to average <strong>" + a + "%</strong> on everything else to get 90% in the class.<br><br> You will need to average <strong>" + b + "%</strong> on everything else to get 80% in the class.<br><br> You will need to average <strong>" + c + "%</strong> on everything else to get 70% in the class.<br><br> You will need to average <strong>" + d + "%</strong> on everything else to get 60% in the class." : message;
    modal(message);
}