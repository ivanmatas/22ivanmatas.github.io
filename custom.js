document.getElementById("validate").addEventListener("click", fetchTeamData);
document.getElementById("applying_for_grant_yes").addEventListener("click", enableGrantFields);
document.getElementById("applying_for_grant_no").addEventListener("click", disableGrantFields);

var team_id = null;

var form = document.getElementById("form");
form.addEventListener("submit", submitForm, false);

function fetchTeamData(event) {
  event.preventDefault();

  var teamName = $("#team_name").val();
  if (teamName.length === 0) {
    return;
  }

  var url = "http://localhost:3000/website/team-data/" + encodeURI(teamName);

  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      $("#validate").prop("disabled", true);
      $("#afterValidation").show();
      populate_form(xhr.response);
    } else {
      initialize_alert(xhr.response, 'danger', 'team-name-form');
    }
  };

  xhr.open('GET', url);
  xhr.send();
}

function populate_form(response) {
  var teamData = JSON.parse(response);
  $("#team_name").val(teamData.team_name);
  $("#team_description").prop("disabled", false).val(teamData.team_description);
  team_id = teamData.team_id;
  $("#milestones").prepend('<h4 class="borderize"> Previous Team Milestones</h4>');
  for (var i = 0; i < teamData.milestones.length; i++) {
    generate_milestone(teamData.milestones[i], i + 1)
  }

  if (teamData.milestones.length < 5) {
    console.log(teamData.milestones.length);
    for (i = teamData.milestones.length; i < 5; i++) {
      generate_milestone('', i + 1)
    }
  }
}

function generate_milestone(milestoneText, number) {
  var milestone_html = '<label for="team_description">Milestone ' + number + '</label>\n' +
    '  <textarea class="form-control milestones" id="milestone_' + number + '" rows="3" required>' + milestoneText + '</textarea>';
  $("#milestones").append(milestone_html)
}

function initialize_alert(text, type, placementId, prepend = false) {
  var alert = '<div class="alert alert-' + type + '" role="alert">\n' +
    text +
    '            <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
    '              <span aria-hidden="true">&times;</span>\n' +
    '            </button>\n' +
    '          </div>';
  if (prepend) {
    $("#" + placementId).prepend(alert);
  } else {
    $("#" + placementId).append(alert);
  }
}

function enableGrantFields() {
  $("#grant_amount").prop("disabled", false).prop('required', true);
  $("#proceeds_usage_explanation").prop("disabled", false);
}

function disableGrantFields() {
  $("#grant_amount").val("").prop("disabled", true).prop('required', false);
  $("#proceeds_usage_explanation").val("").prop("disabled", true);
}

function submitForm(event) {
  event.preventDefault();    //stop form from submitting

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:3000/website/create-team-renewal/", true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      initialize_alert('Form was successfully submitted!', 'success', 'form', true);
      $("#afterValidation").hide();
    } else {
      initialize_alert(xhr.response, 'danger', 'form', true);
      $("#afterValidation").hide();
    }
  };

  jsonData = setJsonDataForRequest();
  console.log(jsonData);
  xhr.send(JSON.stringify(jsonData));
}

function setJsonDataForRequest() {
  var team_description = $("#team_description").val();
  var is_applying_for_grant = false;
  var grant_amount = null;
  var proceeds_usage_explanation = null;
  if ($("#applying_for_grant_yes:checked").length > 0) {
    is_applying_for_grant = true;
    grant_amount = $("#grant_amount").val();
    proceeds_usage_explanation = $("#proceeds_usage_explanation").val();
  }

  var milestones = $(".milestones");
  var milestoneJsonCollection = [];
  for (var c = 0; c < milestones.length; c++) {
    var structure = {
      milestone_text: milestones.eq(c).val(),
      milestone_number: milestones.eq(c).attr('id')[milestones.eq(c).attr('id').length - 1]
    };
    milestoneJsonCollection.push(structure)
  }

  var jsonData =
    {
      team_renewal: {
        team_id: team_id,
        is_applying_for_grant: is_applying_for_grant,
        wanted_grant_amount: grant_amount,
        proceeds_usage_explanation: proceeds_usage_explanation,
      },
      milestones: milestoneJsonCollection,
      team_description: team_description
    };

  return jsonData
}
