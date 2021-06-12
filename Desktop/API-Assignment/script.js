const button = document.querySelector('.button')
const EmailAddress = document.querySelector('.EmailAddress')
const mailboxname = document.querySelector('.mailboxname')
const domainname = document.querySelector('.domainname')
const domainorganization = document.querySelector('.domainorganization')
const domaincountry = document.querySelector('.domaincountry')
const domainavailability = document.querySelector('.domainavailability')

button.addEventListener("click", function() {

    const email = document.querySelector('#email').value;

function getEmail(){
    fetch("https://global-email-v4.p.rapidapi.com/v4/WEB/GlobalEmail/doGlobalEmail?emai=${email}&opt=VerifyMailbox%3AExpress%7CVerifyMailbox%3AExpressPremium&format=json", {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": "71fe32797emsh29f8b6fe44bd56ap1bc4fajsnfd6d17518c9c",
		"x-rapidapi-host": "global-email-v4.p.rapidapi.com"
	}
})
.then((response) => response.json())
.then((response) => {
	console.log(response);

        const displayemailaddress = response[`${email}`]['emailaddress'];
        const displaymailboxname = response[`${email}`]['mailboxname'];
        const displaydomainname= response[`${email}`]['domainname'];
        const displaydomainorganization = response[`${email}`]['domainorganization'];
        const displaydomaincountry = response[`${email}`]['country'];

        emailaddress.innerHTML = `Email Address = ${displayemailaddress}`;
        mailboxname.innerHTML = `<Mail Box Name = ${displaymailboxname}`;
        domainname.innerHTML = `Domain Name = ${displaydomainname}`;
        domainorganization.innerHTML = `Domain Organization = ${displaydomainorganization}`
        domaincountry.innerHTML = `Domain Country = ${displaydomaincountry}`;
})
.catch((err) => {
	console.error(err);
});
}
getEmail();
});