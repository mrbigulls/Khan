$(function () {
	var reader = new FileReader();
	var configFile = [];
	var XMLdata = [];
	var AdminPanelPos = "down";
	var sessionReady = false;
	var User = [];

	var ParticipantAccounts = [];
	var Condition = [];
	var SessionBlocks = [];
	var Outcomes = [];
	var Groupings = [];
	var Words = [];
	var Profiles = [];
	
	$('#login_button').click( LoginButtonClicked );
	$('#loadFileButton').click( LoadButtonClicked );
	$('#sliderButton').click( SliderButtonClicked );
	$('.loginControls').prop('disabled', true);
	$('#loadFileButton').prop('disabled', true);
	$('.adminInput').change( checkSessionButtonReady );
	
	function Session(outcome, groupSize) {
		$('#userScreen').html('You have been placed in a group of 2 members in this trial. If you and the other group member meet the goal of making X selections before the end of the trial block, each one of you will earn a bonus.  Bonuses may be exchanged for money at the end of the session.  This means you must make at least X correct responses to meet your individual goal.  At the end of the trial, you and the other group member will find out whether all members in the group met their individual goal or not.');
	}
	
	function StartSession() {
		$('#userScreen').html('');
		for(var i = 0; i < SessionBlocks; i++)
		{
			var outcome = Outcomes[Math.floor(Math.random() * Outcomes.length)];
			var groupSize = Groupings[Math.floor(Math.random() * Groupings.length)];
			Session(outcome, groupSize);
		}
	}
	
	function checkSessionButtonReady() {
		if($('#configFile').val() != '' && $('#feedbackCondition').val() != '')
		{
			$('#loadFileButton').prop('disabled', false);
		}
		else
		{
			$('#loadFileButton').prop('disabled', true);
		}
	}
	
	function ValidateCredentials(u, p) {
		for(var i = 0; i < ParticipantAccounts.length; i++)
		{
			if(ParticipantAccounts[i].username == u)
			{
				if(ParticipantAccounts[i].password == p)
				{
					return true;
				}
				return false;
			}
		}
		return false;
	}
	
	function LoginButtonClicked() {
		console.log('login clicked');
		var u = $('#login_username').val();
		var p = $('#login_password').val();
		if( ValidateCredentials(u, p) )
		{
			$('#loginFeedback').text('Valid login.');
			User = u;
			StartSession();
		}
		else
		{
			$('#loginFeedback').text('Invalid login information.');
		}
	}
	
	function SliderButtonClicked() {
		if(AdminPanelPos == "down")
		{
			if( sessionReady )
			{
				$(this).text("x Admin x");
				$(this).prop('disabled', true);
			}
			else
			{
				$(this).text("v Admin v");
			}
			AdminPanelPos = "up";
			$("#configScreen").animate({ top: "-95px" }, 1000);
		}
		else
		{
			$(this).text("^ Admin ^");
			AdminPanelPos = "down";
			$("#configScreen").animate({ top: "0px" }, 1000);
		}
	}
	
	function LoadButtonClicked() {
		configFile = $('#configFile').get(0).files[0];
		reader.onload = function(e)
						{
							var textContents = e.target.result;
							var xmlDoc = $.parseXML( textContents );
							XMLdata = $( xmlDoc );
							FileLoaded();
						};
		reader.readAsText(configFile);
	}
	
	function FileLoaded() {
		Condition = $('#feedbackCondition').val();
		XMLdata.find('accounts').children().each(function(){
			ParticipantAccounts.push({ username: $(this).find('username').text(), password: $(this).find('password').text() });
		});
		SessionBlocks = XMLdata.find('sessionblocks').text();
		XMLdata.find('outcomes').children().each(function(){
			Outcomes.push( $(this).text() );
		});
		XMLdata.find('groupings').children().each(function(){
			Groupings.push( $(this).text() );
		});
		XMLdata.find('words').children().each(function(){
			Words.push({ display: $(this).find('display').text(), translate: $(this).find('translate').text() });
		});
		//Profiles?
		$('#adminMessage').text('Ready for user log in.');
		$('.loginControls').prop('disabled', false);
		sessionReady = true;
	};
});