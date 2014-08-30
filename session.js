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
	var OrderedOutcomes = [];
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
	
	function ClickShowResults() {
		var ResultsMarkup = '<table class=\'data-table\'><tr class=\'data-table\'><td class=\'data-table\'>User: ' + User + '</td><td class=\'data-table\'>Condition: ' + Condition + '</td></tr></table><br />';
		for(var i = 0; i < CompletedTrialBlocks.length; i++)
		{
			ResultsMarkup = ResultsMarkup + '<table class=\'data-table\'><tr class=\'data-table\'><td class=\'data-table\'>Trialblock: ' + i + '</td><td>Outcome: ' + OrderedOutcomes[i] + '</td><td class=\'data-table\'>Grouping: ' + GroupingOrder[i] + '</td><td class=\'data-table\'></td></tr>';
			ResultsMarkup = ResultsMarkup + '<tr class=\'data-table\'><td class=\'data-table\'>Trial</td><td class=\'data-table\'>Presented</td><td>Clicked</td></tr>';
			for(var j = 0; j < CompletedTrialBlocks[i].TranslationsClicked.length; j++)
			{
				ResultsMarkup = ResultsMarkup + '<tr class=\'data-table\'><td class=\'data-table\'>' + j + '</td><td class=\'data-table\'>' + CompletedTrialBlocks[i].WordsDisplayed[j].display + '</td><td>' + CompletedTrialBlocks[i].TranslationsClicked[j] + '</td></tr>';
			}
			ResultsMarkup = ResultsMarkup + '</table><br />';
		}
		var w = window.open();
		$(w.document.body).html(ResultsMarkup);
	}
	
	function EndSession() {
		$('#TrialScreen').html( EndOfSessionMessage );
		$('#TrialScreen').show();
		$('.adminInput').prop('disabled', true);
		$('#loadFileButton').prop('disabled', true);
		$('#adminMessage').text('Click here to view results.');
		$('#adminMessage').click( ClickShowResults );
		$('#sliderButton').css('color', '#ff0000');
		$('#sliderButton').prop('disabled', false);
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
	
	function SpecOutcomesByGroupSizeAndOutcome(size, outcomeRate) {
		var out_array = [];
		var fails = 0;
		if(outcomeRate == 1)
		{
			fails = 1;
		}
		else
		{
			fails = size*outcomeRate;
		}
		for(var i = 0; i < size; i++)
		{
			out_array.push( (i >= fails) );
		}
		return Shuffle(out_array);
	}
	
	function PresentSpecificOutcomes() {
		var randProfiles = Shuffle(Profiles);
		var spec_outcomes = SpecOutcomesByGroupSizeAndOutcome(GroupingOrder[CurrentTrialBlockIndex], OrderedOutcomes[CurrentTrialBlockIndex]);
		var OutputMarkup = "randomly chosen failure rate: " + OrderedOutcomes[CurrentTrialBlockIndex] + "<br/><table class='data-table'><tr class='data-table'>";
		for(var i = 0; i < GroupingOrder[CurrentTrialBlockIndex]; i++)
		{
			OutputMarkup = OutputMarkup + "<td class='data-table'>" + randProfiles[i].name + " " + randProfiles[i].image + " Pass?: " + spec_outcomes[i] + "</td>";
			if(i % 3 == 2)
			{
				OutputMarkup = OutputMarkup + "</tr><tr>";
			}
		}
		OutputMarkup = OutputMarkup + "</tr></table>";
		$('#BlockEndScreenMessage').append( OutputMarkup );
	}
	
	function PresentTrialBlockResults() {
		feedbackMessage = TrialBlockFeedbackMessage;
		var currentWrong = TrialsPerBlock - CurrentCorrectCount;
		var personalFeedback = 'You made ' + CurrentCorrectCount + ' correct inputs and ' + currentWrong + ' incorrect inputs.';
		$('#BlockEndScreenMessage').html(TrialBlockFeedbackMessage + ' ' + personalFeedback);
		if(Condition == 'MPSF')
		{
			PresentSpecificOutcomes();
		}
		else
		{
			$('#BlockEndScreenMessage').append('Not specific outcome: ' + OrderedOutcomes[CurrentTrialBlockIndex]);
		}
		$('#BlockEndButton').prop('disabled', false);
		CurrentTrialBlockIndex++;
		$('#BlockEndScreen').show();
	}
	
	function EndTrialBlock() {
		console.log('Ending trial block');
		$('#TrialScreen').hide();
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
		OrderedOutcomes.push(Outcomes[Math.floor(Math.random() * Outcomes.length)]);
		var introMessage = TrialBlockIntroMessage;
		if(Condition != 'NMP')
		{
			introMessage = introMessage + ' Group size: ' + GroupingOrder[CurrentTrialBlockIndex];
		}
		$('#blockIntroMessage').text(introMessage);
		$('#blockIntroScreen').show();
		CurrentTrialIndex = 0;
		CurrentCorrectCount = 0;
	}
	
	function StartSession() {
		$('#userScreen').html('');
		TrialBlocksPerSession = GroupBlocksPerSession*Groupings.length;
		for(var i = 0; i < GroupBlocksPerSession; i++)
		{
			$.merge(GroupingOrder, Shuffle(Groupings));
		}
		console.log('GroupingOrder: ' + GroupingOrder);
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
			$(this).text("v Admin v");
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
		EndOfSessionMessage = XMLdata.find('endofsessionmessage').text();
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
		XMLdata.find('profiles').children().each(function(){
			Profiles.push({ name: $(this).find('name').text(), image: $(this).find('image').text() });
		});
		$('#adminMessage').text('Ready for user log in.');
		$('.loginControls').prop('disabled', false);
		sessionReady = true;
	};
	
	function Shuffle(source_array) {
		var arr = [];
		
		for(var i = 0; i < source_array.length; i++)
		{
			arr.push( source_array[i] );
		}
		
		for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
		
		return arr;
	}
});