$(function () {
	var reader = new FileReader();
	var accounts = [];
	var configFile = [];
	var XMLdata = [];
	var AdminPanelPos = "down";
	$.each($('.accounts'), function(){ accounts.push( $(this).data() ); } );
	
	$('login_button').click();
	$('#loadFileButton').click( LoadButtonClicked );
	$('#sliderButton').click( SliderButtonClicked );
	
	function SliderButtonClicked() {
		if(AdminPanelPos == "down")
		{
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
		console.log('Load Button clicked');
		configFile = $('#configFile').get(0).files[0];
		console.log('File loaded');
		console.log('File size: ' + configFile.size);
		console.log(configFile);
		reader.onload = function(e)
						{
							var textContents = e.target.result;
							var xmlDoc = $.parseXML( textContents );
							XMLdata = $( xmlDoc );
							console.log('xml: ' + XMLdata);
							FileLoaded();
						};
		reader.readAsText(configFile);
	}
	
	function FileLoaded() {
		var accounts = XMLdata.find('accounts').text()
		console.log('Accounts: ' + accounts );
		for(var i = 0; i < accounts; i++)
		{
			var a = XMLdata.find('account' + i);
			console.log(a);
			console.log(a.find('username').text());
			console.log(a.find('password').text());
		}
	};
});