$(function () {
	var reader = new FileReader();
	var configFile = [];
	var XMLdata = [];
	var AdminPanelPos = "down";
	var sessionReady = false;
	var User = [];

	var ParticipantAccounts = [];
	var Condition = [];
	var GroupBlocksPerSession = [];
	var TrialsPerBlock = 0;
	var Outcomes = [];
	var Groupings = [];
	var Words = [];
	var Profiles = [];
	var StimulusDelay = 0;
	var FeedbackDelay = 0;
	var PositiveFeedbackMessage = '';
	var NegativeFeedbackMessage = '';
	var GroupingOrder = [];
	var TrialBlocksPerSession = 0;
	var TrialBlockTimeout = 0;
	var KillIt = false;
	var TrialBlockFeedbackMessage = ''
	var TrialBlockIntroMessage = ''
	var EndOfSessionMessage = '';
	
	var CurrentOutcome = [];
	var CurrentWordsDisplayed = [];
	var CurrentTranslationsClicked = [];
	var CurrentCorrectChoices = [];
	var CurrentCorrectCount = 0;
	var CompletedTrialBlocks = [];
	var CurrentTrialIndex = 0;
	var CurrentTrialBlockIndex = 0;
	var CurrentWrongWord1 = {};
	var CurrentWrongWord2 = {};
	
	$('#login_button').click( LoginButtonClicked );
	$('#loadFileButton').click( LoadButtonClicked );
	$('#sliderButton').click( SliderButtonClicked );
	$('#BlockEndButton').click( BlockEndButtonClicked );
	$('.loginControls').prop('disabled', true);
	$('#loadFileButton').prop('disabled', true);
	$('#BlockEndButton').prop('disabled', true);
	$('.adminInput').change( checkSessionButtonReady );
	$('.startHide').hide();
	$('.startHide').prop('disabled', true);
	$('#BeginTrialBlockButton').click( BeginTrialBlockButtonClick );
	$('.OptionContainer').click( SelectOption );
	
	function TimeoutTrialBlock(tbi) {
		setTimeout( function() {
			if(CurrentTrialBlockIndex <= tbi)
			{
				console.log('Timed out TrialBlock!');
				KillIt = true;
				$('.OptionContainer').prop('disabled', true);
				$('#OptionsScreen').hide();
				EndTrialBlock();
			}
		}, TrialBlockTimeout);
	}
	
	function EndSession() {
		$('#TrialScreen').html( EndOfSessionMessage );
		$('#TrialScreen').show();
		$('.adminInput').prop('disabled', true);
		$('#sliderButton').prop('disabled', false);
		$('#sliderButton').css('color', '#ff0000');
		console.log('End Session!');
	}
	
	function BlockEndButtonClicked() {
		$('#BlockEndScreen').hide();
		$('#BlockEndButton').prop('disabled', true);
		$('#BlockEndScreenMessage').html('');
		if(CurrentTrialBlockIndex < TrialBlocksPerSession)
		{
			StartTrialBlock();
		}
		else
		{
			EndSession();
		}
	}
	
	function PresentTrialBlockResults() {
		feedbackMessage = TrialBlockFeedbackMessage;
		var currentWrong = TrialsPerBlock - CurrentCorrectCount;
		var pesonalFeedback = 'You made ' + CurrentCorrectCount + ' correct inputs and ' + currentWrong + ' incorrect inputs.';
		$('#BlockEndScreenMessage').html(TrialBlockFeedbackMessage + ' ' + personalFeedback);
		if(Condition == 'MPSF')
		{
			$('#BlockEndScreenMessage').append('Specific outcome: ' + Outcomes[CurrentTrialBlockIndex]);
		}
		else
		{
			$('#BlockEndScreenMessage').append('Not specific outcome: ' + Outcomes[CurrentTrialBlockIndex]);
		}
		$('#BlockEndButton').prop('disabled', false);
		$('#BlockEndScreen').show();
	}
	
	function EndTrialBlock() {
		console.log('Ending trial block');
		$('#TrialScreen').hide();
		CurrentTrialBlockIndex++;
		CompletedTrialBlocks.push({
			WordsDisplayed: CurrentWordsDisplayed,
			TranslationsClicked: CurrentTranslationsClicked,
			CorrectChoices: CurrentCorrectChoices
		});
		
		CurrentTrialIndex = 0;
		CurrentWordsDisplayed = [];
		CurrentTranslationsClicked = [];
		CurrentCorrectChoices = [];
		PresentTrialBlockResults();
	}
	
	function EndTrial() {
		if(KillIt)
		{
			KillIt = false;
			return;
		}
		console.log('Ending trial ' + CurrentTrialIndex);
		CurrentTrialIndex++;
		if(CurrentTrialIndex < TrialsPerBlock)
		{
			ConductTrial();
		}
		else
		{
			EndTrialBlock();
		}
	}
	
	function PresentFeedback() {
		$('#OptionsScreen').hide();
		if(KillIt)
		{
			KillIt = false;
			return;
		}
		if(CurrentCorrectChoices[CurrentTrialIndex] == true)
		{
			CurrentCorrectCount = CurrentCorrectCount + 1;
			$('#TrialScreen').html(PositiveFeedbackMessage);
		}
		else
		{
			$('#TrialScreen').html(NegativeFeedbackMessage);
		}
		console.log('Waiting ' + FeedbackDelay + 'ms');
		$('#TrialScreen').show();
		setTimeout(EndTrial, FeedbackDelay);
	}
	
	function SelectOption() {
		$('.OptionContainer').prop('disabled', true);
		CurrentTranslationsClicked.push($(this).text());
		CurrentCorrectChoices.push(CurrentTranslationsClicked[CurrentTrialIndex] == CurrentWordsDisplayed[CurrentTrialIndex].translate);
		PresentFeedback();
	}
	
	function DisplayOptions() {
		if(KillIt)
		{
			KillIt = false;
			return;
		}
		$('.OptionContainer').prop('disabled', false);
		var displayWords = [ CurrentWordsDisplayed[CurrentTrialIndex], CurrentWrongWord1, CurrentWrongWord2 ];
		displayWords = Shuffle(displayWords);
		console.log(displayWords);
		$('#Option1').html(displayWords[0].translate);
		$('#Option2').html(displayWords[1].translate);
		$('#Option3').html(displayWords[2].translate);
		$('#TrialScreen').hide();
		$('#OptionContainer').show();
		$('#OptionsScreen').show();
	}
	
	function ConductTrial() {
		if(KillIt)
		{
			KillIt = false;
			return;
		}
		console.log('Conduct trial ' + CurrentTrialIndex);
		var shuffledWords = Shuffle(Words);
		CurrentWordsDisplayed.push(shuffledWords[0]);
		CurrentWrongWord1 = shuffledWords[1];
		CurrentWrongWord2 = shuffledWords[2];
		$('#TrialScreen').html(shuffledWords[0].display);
		console.log('Waiting ' + StimulusDelay + 'ms');
		$('#TrialScreen').show();
		setTimeout(DisplayOptions, StimulusDelay);
	}
	
	function BeginTrialBlockButtonClick() {
		$('#blockIntroScreen').hide();
		TimeoutTrialBlock(CurrentTrialBlockIndex);
		ConductTrial();
	}
	
	function StartTrialBlock() {
		KillIt = false;
		console.log('Start TrialBlock ' + CurrentTrialBlockIndex);
		CurrentOutcome = Outcomes[Math.floor(Math.random() * Outcomes.length)];
		var introMessage = TrialBlockIntroMessage;
		if(Condition != 'NMP')
		{
			introMessage = introMessage + ' Group size: ' + Groupings[CurrentTrialBlockIndex];
		}
		$('#blockIntroMessage').text(introMessage);
		$('#blockIntroScreen').show();
		CurrentTrialIndex = 0;
	}
	
	function StartSession() {
		$('#userScreen').html('');
		TrialBlocksPerSession = GroupBlocksPerSession*Groupings.length;
		for(var i = 0; i < GroupBlocksPerSession; i++)
		{
			GroupingOrder = GroupingOrder + Shuffle(Groupings);
		}
		StartTrialBlock();
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
				$(this).prop('disabled', true);
				$(this).css('color', '#000000');
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
		EndOfSessionMessage = = XMLdata.find('endofsessionmessage').text();
		TrialBlockIntroMessage = XMLdata.find('trialblockintromessages').find(Condition).text();
		TrialBlockFeedbackMessage = XMLdata.find('trialblockfeedbackmessages').find(Condition).text();
		TrialBlockTimeout = XMLdata.find('trialblocktimeout').text();
		StimulusDelay = XMLdata.find('stimulusdelay').text();
		FeedbackDelay = XMLdata.find('feedbackdelay').text();
		PositiveFeedbackMessage = XMLdata.find('positivefeedback').text();
		NegativeFeedbackMessage = XMLdata.find('negativefeedback').text();
		XMLdata.find('accounts').children().each(function(){
			ParticipantAccounts.push({ username: $(this).find('username').text(), password: $(this).find('password').text() });
		});
		GroupBlocksPerSession = XMLdata.find('groupingblockspersession').text();
		TrialsPerBlock = XMLdata.find('trialsperblock').text();
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
	
	function Shuffle(source_array) {
		var array = source_array.slice();
		var currentIndex = array.length, temporaryValue, randomIndex ;

		while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
		}

		return array;
	}
});