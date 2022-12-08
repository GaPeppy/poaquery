const axios = require('axios')
const assert = require('assert')

//environmental input
const GpartnerId = process.env.NEW_RELIC_PARTNER_ID
const GpartnerApiKey = process.env.NEW_RELIC_PARTNER_API_KEY

//
//
//
async function queryPartnerLoop(){
  aResult = []
  for(ii=1;ii<10;ii++){
    aTmp = await queryPartnerAPI(ii)
    aResult = [...new Set([...aResult,...aTmp])]
    if(aTmp.length < 1000) {break}
  }
  return aResult
}

async function queryPartnerAPI(page=1) {

  sURI = 'https://rpm.newrelic.com/api/v2/partners/' + GpartnerId + '/accounts?page=' + page.toString()
  var options = {
		url: sURI,
    method: 'get',
		headers: {'X-Api-Key': GpartnerApiKey}
  }

  try {
    console.log('queryPartnerAPI()->going for page:', page)
    response = await axios(options)
		if (response.status != 200) {
      console.log('queryPartnerAPI()->axios(get) status failed:',response)
      throw(`queryPartnerAPI()->axios(get) status failed http=[${response.status}]`)
    }

    aAccounts = response.data.accounts
    return aAccounts
  } catch (e) {
    console.log('queryPartnerAPI()->axios.get() failed:',e)
    throw (e)
  }
}

async function main(){
  // get an array of all accounts under the partnership
  var atmp = await queryPartnerLoop()

  //filter out the cancelled accounts
  var aAccounts = atmp.filter(acct => acct.status != 'cancelled')
  aAccounts.sort((a,b) => {
    if(a.parent_account_id == b.parent_account_id){
      if(a.id > b.id) {return 1} else {return -1}
    }
    if (a.parent_account_id > b.parent_account_id){
      return 1
    }
    return -1
  })

  //create output csv and log to stdout
  aAccounts.forEach((val,idx) => {
//   aline = [val.parent_account_id,val.id,val.name,val.status,val.high_security,val.allow_api_access,val["primary admin"].email]
    aline = [val.parent_account_id,val.id,val.name,val.high_security,val.allow_api_access,val["primary admin"].email]
    console.log(aline.join(','))
  })
}

main()
