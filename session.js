$(function () {
	var accounts = [];
	$.each($('.accounts'), function(){ accounts.push( $(this).data() ); } );
	
	$('login_button').click()
});