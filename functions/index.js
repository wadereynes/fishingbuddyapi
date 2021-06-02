const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({ origin: true }))

var serviceAccount = require('./permissions.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fishingbuddy-mobile.firebaseio.com/',
})
const db = admin.database()

// @desc    Create new test
// @route   POST /api/createlist
app.post('/api/createlist', async (req, res) => {
  const test = req.body
  await db.ref('test').push(test)
  res.status(201).send(JSON.stringify(test))
})

// @desc    Fetch all test
// @route   GET /api/testlist
app.get('/api/testlist', async (req, res) => {
  console.log(paramType)

  const snapshot = await db.ref('test')
  snapshot.on('value', (snapshot) => {
    const test = snapshot.val()
    const testList = []
    for (let id in test) {
      testList.push(test[id])
    }
    res.status(200).send(JSON.stringify(testList))
  })
})

// @desc    Fetch single test
// @route   GET /api/testlist/:id
app.get('/api/testlist/:id', async (req, res) => {
  const paramId = req.params.id
  const snapshot = await db.ref(`test/${paramId}`)
  snapshot.on('value', (snapshot) => {
    const test = snapshot.val()
    const testList = []
    for (let id in test) {
      testList.push(test[id])
    }
    res.status(200).send(JSON.stringify(testList))
  })
})

// @desc    Update a test
// @route   PUT /api/updatelist/:id
app.put('/api/updatelist/:id', async (req, res) => {
  const body = req.body
  const paramId = req.params.id
  await db.ref(`test/${paramId}`).update(body)
  res.status(200).send(JSON.stringify(body))
})

// @desc    Delete a test
// @route   DELETE /api/deletelist/:id
app.delete('/api/deletelist/:id', async (req, res) => {
  const paramId = req.params.id
  await db.ref(`test/${paramId}`).remove()

  res.status(200).send(JSON.stringify('removed'))
})

// @desc    Fetch all products,
// @route   GET /api/productslist
// sample   https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/productslist
app.get('/api/productslist', async (req, res) => {
  const snapshot = await db.ref('products')
  snapshot.on('value', (snapshot) => {
    const product = snapshot.val()
    const productslist = []
    for (let id in product) {
      productslist.push(product[id])
    }
    res.status(200).send(JSON.stringify(productslist))
  })
})

// @desc    Fetch single product.
// @route   GET /api/testlist/:id
// sample   https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/productslist/-MX2KpsSSs2vN4Y122V0
// sample   http://localhost:5001/fishingbuddy-web/us-central1/app/api/productslist/-MX2KpsSSs2vN4Y122V0
app.get('/api/productslist/:id', async (req, res) => {
  const paramId = req.params.id
  const snapshot = await db.ref(`products/${paramId}`)
  snapshot.on('value', (snapshot) => {
    const product = snapshot.val()
    console.log(product)
    res.status(200).send(JSON.stringify(product))
  })
})

// @desc    Fetch all products by seller. 
// @route   GET /api/sellerproducts/:id
// sample   https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/sellerproducts/XHeEMkE1QgSEIePxrX56aOy19bf2
// sample   http://localhost:5001/fishingbuddy-web/us-central1/app/api/sellerproducts/XHeEMkE1QgSEIePxrX56aOy19bf2
app.get('/api/sellerproducts/:id', async (req, res) => {
  const userId = req.params.id
  const snapshot = await db.ref('products')
  snapshot.on('value', (snapshot) => {
    const product = snapshot.val()
    const productslist = []
    for (let id in product) {
      if(product[id].ownerId==userId){
        product[id]['productId'] = id
        productslist.push(product[id])
      }
    }
    res.status(200).send(JSON.stringify(productslist))
  })
})

// @desc    Fetch all products by category. 
// @route   GET /api/productsoncategory/:id
// sample   https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/productsoncategory/fish
// sample   http://localhost:5001/fishingbuddy-web/us-central1/app/api/productsoncategory/fish
app.get('/api/productsoncategory/:id', async (req, res) => {
  const productCategory = req.params.id
  const snapshot = await db.ref('products')
  snapshot.on('value', (snapshot) => {
    const product = snapshot.val()
    const productslist = []
    for (let id in product) {
      if(product[id].category==productCategory && product[id].isListed == 'yes'){
        productslist.push(product[id])
      }
    }
    res.status(200).send(JSON.stringify(productslist))
  })
})

// @desc    Fetch all gear setups.
// @route   GET /api/fishingtechniques/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/gearsetups
app.get('/api/gearsetups', async (req, res) => {
  const snapshot = await db.ref('gearsetup')
  snapshot.on('value', (snapshot) => {
    const gearsetups = snapshot.val()
    res.status(200).send(JSON.stringify(gearsetups))
  })
})

// @desc    Fetch top 3 recommended fishing gears.
// @route   GET /api/recommendgear
// sample   http://localhost:5001/fishingbuddy-web/us-central1/app/api/recommendgear/spinning/spinning/multicolor/monofilament/minnow/shorecasting/small/amateur/5000
// sample   http://localhost:5001/fishingbuddy-web/us-central1/app/api/recommendgear/1/1/2/3/1/1/1/1/5000
// sample   https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/recommendgear/1/1/2/3/1/1/1/1/5000
app.get('/api/recommendgear/:reelType/:rodType/:braidlineType/:llineType/:lureType/:enviType/:catchType/:hobbyistType/:budget', async (req, res) => {
  const snapshot = await db.ref('gearsetup')
  snapshot.on('value', (snapshot) => {
    const gearsetup = snapshot.val()
    const gearsetuplist = []
    var discretizedPreferredSetup = [req.params.reelType, req.params.rodType, req.params.braidlineType, req.params.llineType, req.params.lureType, req.params.enviType, req.params.catchType, req.params.hobbyistType, (req.params.budget/1000).toFixed(2)]
    
    var discretizedGearSetupList = []
    var gearRecommendationResult = []
    var noRecommendation = [] //insuffecient data
    for (let id in gearsetup) {
       if(gearsetup[id]['verified'] || gearsetup[id]['verified']=='true'){
         console.log(gearsetup[id])
       gearsetuplist.push(gearsetup[id])
       var discretizedGearSetup = {rodScore: gearsetup[id].rodTypeIndex,reelScore: gearsetup[id].reelTypeIndex,braidlineScore: gearsetup[id].braidlineIndex,leaderlineScore: gearsetup[id].leaderlineIndex,lureScore: gearsetup[id].lureIndex,environmentScore: gearsetup[id].environmentTypeIndex,catchScore: gearsetup[id].catchTypeIndex,hobbyistScore: gearsetup[id].hobbyistTypeIndex,priceScore: (gearsetup[id].totalPrice/1000).toFixed(2),setupId: id, distanceScore: ''}
       var distanceScore = calculateKNNforGearRecommender( discretizedPreferredSetup,discretizedGearSetup)
       discretizedGearSetup.distanceScore = distanceScore
       discretizedGearSetupList.push(discretizedGearSetup)
       }
    }
    
    discretizedGearSetupList.sort((a,b) => a.distanceScore - b.distanceScore);
    console.log(discretizedGearSetupList.length)
    if(discretizedGearSetupList.length > 3){
    var count = 0;
    while(count < 3){
    db.ref(`gearsetup/${discretizedGearSetupList[count].setupId}`).on('value',function(snapshot) {
        gearRecommendationResult.push(snapshot.val()) 
       })
       count+=1
      }
    res.status(200).send(JSON.stringify(gearRecommendationResult))
    } else{
      console.log("no recommendation")
    res.status(200).send(JSON.stringify(noRecommendation))
    }
  })
})

function calculateKNNforGearRecommender(userPreference, gearSetups){
  var distance = (Math.pow(userPreference[0]-gearSetups.rodScore,2)+Math.pow(userPreference[1]-gearSetups.reelScore,2)+Math.pow(userPreference[2]-gearSetups.braidlineScore,2)+Math.pow(userPreference[3]-gearSetups.leaderlineScore,2)+Math.pow(userPreference[4]-gearSetups.lureScore,2)+Math.pow(userPreference[5]-gearSetups.environmentScore,2)+Math.pow(userPreference[6]-gearSetups.catchScore,2)+Math.pow(userPreference[7]-gearSetups.hobbyistScore,2)+Math.pow(userPreference[8]-gearSetups.priceScore,2)).toFixed(2)
  
  return distance
}

// @desc    Fetch all newsfeed posts for social page.
// @route   GET /api/newsfeed
// sample   http://localhost:5001/fishingbuddy-web/us-central1/app/api/newsfeed
// sample   https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/newsfeed
app.get('/api/newsfeed', async (req, res) => {
  const snapshot = await db.ref('user')
  snapshot.on('value', (snapshot) => {
    const user = snapshot.val()
    const userslist = []
    for (let id in user) {
      const userID = id
      if(user[id].posts!=null){
        const userposts = user[id].posts
        for(let id in userposts){
          userposts[id]['postId'] = id
          userposts[id]['authorId'] = userID
          userslist.push(userposts[id])
        }
      }
    }
    userslist.sort((a,b) => a.datePosted - b.datePosted)

    res.status(200).send(JSON.stringify(userslist))
  })
})

// @desc    Fetch all news for discover page.
// @route   GET /api/news
// sample   GET http://localhost:5001/fishingbuddy-web/us-central1/app/api/news
// sample   https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/news
app.get('/api/news', async (req, res) => {
  const snapshot = await db.ref('discover/news')
  snapshot.on('value', (snapshot) => {
    const discover = snapshot.val()
    const newslist = []
    for (let id in discover) {
      newslist.push(discover[id])
    }
    console.log(newslist)
    res.status(200).send(JSON.stringify(newslist))
  })
})

// @desc    Fetch all fishes for discover page.
// @route   GET /api/fishlist
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/fishlist
app.get('/api/fishlist', async (req, res) => {
  const snapshot = await db.ref('discover/fishlist')
  snapshot.on('value', (snapshot) => {
    const fish = snapshot.val()
    const fishList = []
    for (let id in fish) {
      fish[id]['fishID'] = id
      console.log(fish[id])
      fishList.push(fish[id])
    }
    res.status(200).send(JSON.stringify(fishList))
  })
})

// @desc    Fetch single product.
// @route   GET /api/testlist/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/fishlist/-MVCA-81zxk1ntkrcnWw
app.get('/api/fishlist/:id', async (req, res) => {
  const paramId = req.params.id
  const snapshot = await db.ref(`discover/fishlist/${paramId}`)
  snapshot.on('value', (snapshot) => {
    const fish = snapshot.val()
    res.status(200).send(JSON.stringify(fish))
  })
})

// @desc    Fetch all fishes for discover page.
// @route   GET /api/fishingtechniques
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/fishingtechniques
app.get('/api/fishingtechniques', async (req, res) => {
  const snapshot = await db.ref('discover/fishingtechniques')
  snapshot.on('value', (snapshot) => {
    const technique = snapshot.val()
    const techniqueList = []
    for (let id in technique) {
      technique[id]['techniqueID'] = id
      techniqueList.push(technique[id])
    }
    res.status(200).send(JSON.stringify(techniqueList))
  })
})

// @desc    Fetch all fishes for discover page.
// @route   GET /api/fishingtechniques/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/fishingtechniques/-MUU2UPHhWcVTsL60_GZ
app.get('/api/fishingtechniques/:id', async (req, res) => {
  const paramId = req.params.id
  const snapshot = await db.ref(`discover/fishingtechniques/${paramId}`)
  snapshot.on('value', (snapshot) => {
    const technique = snapshot.val()
    res.status(200).send(JSON.stringify(technique))
  })
})

// @desc    Fetch all fishes for discover page.
// @route   GET /api/bfarregulations
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/bfarregulations
app.get('/api/bfarregulations', async (req, res) => {
  const snapshot = await db.ref('discover/fishingregulations/bfarregulations')
  snapshot.on('value', (snapshot) => {
    const regulation = snapshot.val()
    const bfarregulations = []
    for (let id in regulation) {
      regulation[id]['regulationID'] = id
      bfarregulations.push(regulation[id])
    }
    res.status(200).send(JSON.stringify(bfarregulations))
  })
})

// @desc    Fetch all fishes for discover page.
// @route   GET /api/bfarregulations/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/bfarregulations/-MUit6QQKWoidN_14eYl
app.get('/api/bfarregulations/:id', async (req, res) => {
  const paramId = req.params.id
  const snapshot = await db.ref(`discover/fishingregulations/bfarregulations/${paramId}`)
  snapshot.on('value', (snapshot) => {
    const bfarregulation = snapshot.val()
    res.status(200).send(JSON.stringify(bfarregulation))
  })
})

// @desc    Fetch all fishes for discover page.
// @route   GET /api/endangeredspecies
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/bfarregulations
app.get('/api/endangeredspecies', async (req, res) => {
  const snapshot = await db.ref('discover/fishingregulations/endangeredspecies')
  snapshot.on('value', (snapshot) => {
    const regulation = snapshot.val()
    const endangeredSpecies = []
    for (let id in regulation) {
      regulation[id]['regulationID'] = id
      endangeredSpecies.push(regulation[id])
    }
    res.status(200).send(JSON.stringify(endangeredSpecies))
  })
})

// @desc    Fetch all fishes for discover page.
// @route   GET /api/endangeredspecies/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/endangeredspecies/-MUihfZpY5mdcaSvEPL-
app.get('/api/endangeredspecies/:id', async (req, res) => {
  const paramId = req.params.id
  const snapshot = await db.ref(`discover/fishingregulations/endangeredspecies/${paramId}`)
  snapshot.on('value', (snapshot) => {
    const endangeredSpecie = snapshot.val()
    res.status(200).send(JSON.stringify(endangeredSpecie))
  })
})

// @desc    Fetch all fishes for discover page.
// @route   GET /api/endangeredspecies
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/catchsizeregulations
app.get('/api/catchsizeregulations', async (req, res) => {
  const snapshot = await db.ref('discover/fishingregulations/catchsizerules')
  snapshot.on('value', (snapshot) => {
    const regulation = snapshot.val()
    const catchsizerules = []
    for (let id in regulation) {
      regulation[id]['regulationID'] = id
      catchsizerules.push(regulation[id])
    }
    res.status(200).send(JSON.stringify(catchsizerules))
  })
})

// @desc    Fetch all fishes for discover page.
// @route   GET /api/endangeredspecies/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/endangeredspecies/-MUihfZpY5mdcaSvEPL-
app.get('/api/catchsizeregulations/:id', async (req, res) => {
  const paramId = req.params.id
  const snapshot = await db.ref(`discover/fishingregulations/catchsizerules/${paramId}`)
  snapshot.on('value', (snapshot) => {
    const catchsizerule = snapshot.val()
    res.status(200).send(JSON.stringify(catchsizerule))
  })
})

// @desc    Fetch all fishing hotspots near fisherman/hobbyist's location.
// @route   GET /api/fishinghotspots/:latitude/:longitude
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/fishinghotspots/10.24870314947608/123.79995056874762
app.get('/api/fishinghotspots/:latitude/:longitude', async (req, res) => {
  //10.24870314947608, 123.79995056874762
  const currenLatitude = req.params.latitude 
  const currentLongitude = req.params.longitude
  const snapshot = await db.ref('hotspot')
  const nearmeHotspot = []

  snapshot.on('value', (snapshot) => {
    const hotspots = snapshot.val()
    for(let id in hotspots){
      const result = calculateDistance(currenLatitude, currentLongitude, hotspots[id]['latitude'], hotspots[id]['longitude']);
      console.log("distance result ", result)
      hotspots[id]['distanceFromCurrent'] = result
      nearmeHotspot.push(hotspots[id])
    }

    nearmeHotspot.sort((a,b) => a.distanceFromCurrent - b.distanceFromCurrent);
    res.status(200).send(JSON.stringify(nearmeHotspot))
  })
})

//Haversine Formula to get the distance of two locations.
function calculateDistance(curLatitude, curLongitude, hotspotLatitude, hotspotLongitude){
  const prevLatInRad = toRad(hotspotLatitude);
  const prevLongInRad = toRad(hotspotLongitude);
  const latInRad = toRad(curLatitude);
  const longInRad = toRad(curLongitude);

  var result = 6377.830272 * Math.acos(Math.sin(prevLatInRad) * Math.sin(latInRad) + Math.cos(prevLatInRad) * Math.cos(latInRad) * Math.cos(longInRad - prevLongInRad),)
  
  return (
     result.toFixed(2)
  );
}

function toRad(angle){
  return (angle * Math.PI) / 180;
}

// @desc    Fetch all fishing hotspots near fisherman/hobbyist's location.
// @route   GET /api/fishinghotspots/:latitude/:longitude
// sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/recommendcatch/300/1/1/0/0
app.get('/api/recommendcatch/:budget/:forSinugba/:forFried/:forKinilaw/:forTinuwa/:city/:lat/:long', async (req, res) => {
  const snapshot = await db.ref('products')
  const lat = req.params.lat
  const long = req.params.long
  const recommendedCatch = []
  
  var userPreference = [(req.params.budget/100).toFixed(2), req.params.forSinugba, req.params.forFried, req.params.forKinilaw, req.params.forTinuwa]
  snapshot.on('value', (snapshot) => {
    const products = snapshot.val()
    
    for(let id in products){
      var timeDifference = getDifferenceInDays(products[id]['createdDate'], new Date())
      if(products[id]['storeLocation']!=undefined){
        if(products[id]['storeLocation']['lat']!=undefined && products[id]['storeLocation']['lng']!=undefined){
            if(products[id]['category'] == 'fish' && products[id]['stock']!=0 && products[id]['isListed']== 'yes' && timeDifference <= 1.5)
            {
              var locationDistance = calculateDistance(lat, long, products[id]['storeLocation']['lat'], products[id]['storeLocation']['lng'])
              var product = [(products[id]['price']/100).toFixed(2), products[id]['fishSelected']['forSinugba'],products[id]['fishSelected']['forFried'],products[id]['fishSelected']['forKilawin'],products[id]['fishSelected']['forTinuwa']]
              products[id]['distance'] = calculateKNNforCatchRecommender(userPreference,product, locationDistance)
              products[id]['productId'] = id
              recommendedCatch.push(products[id])
            }
        }
      }
    }

    recommendedCatch.sort((a,b) => a.distance - b.distance);
    res.status(200).send(JSON.stringify(recommendedCatch))
  })
})

function calculateKNNforCatchRecommender(userPreference, catchProduct, locationDistance){
  var distance = (Math.pow(userPreference[0]-catchProduct[0],2)+Math.pow(userPreference[1]-catchProduct[1],2)+Math.pow(userPreference[2]-catchProduct[2],2)+Math.pow(userPreference[3]-catchProduct[3],2)+Math.pow(userPreference[4]-catchProduct[4],2)+Math.pow(locationDistance,2)).toFixed(2)
  
  return distance
}

function getDifferenceInDays(date1, date2) {
  const diffInMs = Math.abs(date2 - date1);
  return diffInMs / (1000 * 60 * 60 * 24);
}

function getDate(currentdate){
  var datetime = new Date(currentdate).toLocaleDateString("en-US")
  console.log("date created:", datetime)
  return datetime;
}

//Add marketplace sort endpoint

// @desc    Fetch all braidline types.
// @route   GET /api/braidlines
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/braidlines
//sample    https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/braidlines
app.get('/api/braidlines', async (req, res) => {
  const snapshot = await db.ref('hobbyist/braidlineType')
  snapshot.on('value', (snapshot) => {
    const result = snapshot.val()
    const braidlines = []
    for(let id in result){
      result[id]['gearTypeName'] = result[id]['braidlineTypeName']
      result[id]['gearTypeIndex'] = result[id]['recommenderIndex']
      braidlines.push(result[id])
    }
    res.status(200).send(JSON.stringify(braidlines))
  })
})

// @desc    Fetch all catch types.
// @route   GET /api/catchtypes
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/catchtypes
//sample    https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/catchtypes
app.get('/api/catchtypes', async (req, res) => {
  const snapshot = await db.ref('hobbyist/catchType')
  snapshot.on('value', (snapshot) => {
    const result = snapshot.val()
    const catchTypes = []
    for(let id in result){
      result[id]['gearTypeName'] = result[id]['catchTypeName']
      result[id]['gearTypeIndex'] = result[id]['recommenderIndex']
      catchTypes.push(result[id])
    }
    res.status(200).send(JSON.stringify(catchTypes))
  })
})

// @desc    Fetch all environment types.
// @route   GET /api/environments
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/environments
//sample    https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/environments
app.get('/api/environments', async (req, res) => {
  const snapshot = await db.ref('hobbyist/environmentType')
  snapshot.on('value', (snapshot) => {
    const result = snapshot.val()
    const environmentTypes = []
    for(let id in result){
      result[id]['gearTypeName'] = result[id]['fishingEnviTypeName']
      result[id]['gearTypeIndex'] = result[id]['recommenderIndex']
      environmentTypes.push(result[id])
    }
    res.status(200).send(JSON.stringify(environmentTypes))
  })
})

// @desc    Fetch all leaderline types.
// @route   GET /api/leaderlines
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/leaderlines
//sample    https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/leaderlines
app.get('/api/leaderlines', async (req, res) => {
  const snapshot = await db.ref('hobbyist/leaderlineType')
  snapshot.on('value', (snapshot) => {
    const result = snapshot.val()
    const leaderlines = []
    for(let id in result){
      result[id]['gearTypeName'] = result[id]['leaderlineTypeName']
      result[id]['gearTypeIndex'] = result[id]['recommenderIndex']
      leaderlines.push(result[id])
    }
    res.status(200).send(JSON.stringify(leaderlines))
  })
})

// @desc    Fetch all lure types.
// @route   GET /api/lures
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/lures
//sample    https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/lures
app.get('/api/lures', async (req, res) => {
  const snapshot = await db.ref('hobbyist/lureType')
  snapshot.on('value', (snapshot) => {
    const result = snapshot.val()
    const lures = []
    for(let id in result){
      result[id]['gearTypeName'] = result[id]['lureTypeName']
      result[id]['gearTypeIndex'] = result[id]['recommenderIndex']
      lures.push(result[id])
    }
    res.status(200).send(JSON.stringify(lures))
  })
})

// @desc    Fetch all reel types.
// @route   GET /api/reels
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/reels
//sample    https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/reels
app.get('/api/reels', async (req, res) => {
  const snapshot = await db.ref('hobbyist/reelType')
  snapshot.on('value', (snapshot) => {
    const result = snapshot.val()
    const reels = []
    for(let id in result){
      result[id]['gearTypeName'] = result[id]['reelTypeName']
      result[id]['gearTypeIndex'] = result[id]['recommenderIndex']
      reels.push(result[id])
    }
    res.status(200).send(JSON.stringify(reels))
  })
})

// @desc    Fetch all rod types.
// @route   GET /api/rods
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/rods
//sample    https://us-central1-fishingbuddy-web.cloudfunctions.net/app/api/rods
app.get('/api/rods', async (req, res) => {
  const snapshot = await db.ref('hobbyist/rodTypes')
  snapshot.on('value', (snapshot) => {
    const result = snapshot.val()
    const rods = []
    for(let id in result){
      result[id]['gearTypeName'] = result[id]['rodTypeName']
      result[id]['gearTypeIndex'] = result[id]['recommenderIndex']
      rods.push(result[id])
    }
    res.status(200).send(JSON.stringify(rods))
  })
})

// @desc    Fetch all user trips.
// @route   GET /api/hotspots/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/hotspots/DavLTQLiy6dZXtBRB2pIst5HHwv1
app.get('/api/hotspots/:id', async (req, res) => {
  const paramId = req.params.id
  const snapshot = await db.ref(`hotspot`)

  snapshot.on('value', (snapshot) => {
    const hotspots = snapshot.val()
    console.log(hotspots)
    const userHotspots = []
      for (let id in hotspots) {
        if(hotspots[id]['uuid']==paramId){
          userHotspots.push(hotspots[id])
        }
      }
      res.status(200).send(JSON.stringify(userHotspots))
    })
})

// @desc    Fetch all user catch.
// @route   GET /api/endangeredspecies/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/userCatch/XHeEMkE1QgSEIePxrX56aOy19bf2
app.get('/api/userCatch/:id', async (req, res) => {
  const paramId = req.params.id
  const snapshot = await db.ref(`user/${paramId}`)
  const userCatch = []
  snapshot.on('value', (snapshot) => {
    const user = snapshot.val()
    const userPosts = user['posts']
    for(let id in userPosts){
      if(userPosts[id]['catch']!=null){
        userCatch.push(userPosts[id]['catch'])
      }
    }
    res.status(200).send(JSON.stringify(userCatch))
  })
})

// @desc    Fetch all user products.
// @route   GET /api/endangeredspecies/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/userProducts/sougayilang/rod/cebu/10.299952482992184/123.8698153951779
app.get('/api/userProducts/:id/:type/:city/:lat/:long', async (req, res) => {
  const paramId = req.params.id
  const type = req.params.type
  const lat = req.params.lat
  const long = req.params.long
  const city = req.params.city
  const snapshot = await db.ref(`products`)

  snapshot.on('value', (snapshot) => {
    const products = snapshot.val()
    const userProducts = []
      for (let id in products) {
        if(products[id]['storeLocation']!=undefined){
          if(products[id]['storeLocation']['lat']!=undefined && products[id]['storeLocation']['lng']!=undefined){
            if(((products[id]['title']).toLowerCase()).includes((paramId).toLowerCase()) && (products[id]['category']).toLowerCase()==type.toLowerCase() && products[id]['isListed']=='yes' && products[id]['storeLocation']['city'].toLowerCase().includes((city).toLowerCase())){
              products[id]['locationDistance'] = calculateDistance(lat, long, products[id]['storeLocation']['lat'], products[id]['storeLocation']['lng'])
              products[id]['productId']=id
              userProducts.push(products[id])
            }
          }
        }
      }

      userProducts.sort((a,b) => a.locationDistance - b.locationDistance);
      res.status(200).send(JSON.stringify(userProducts))
    })
})

// @desc    Fetch all user products.
// @route   GET /api/endangeredspecies/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/userRecoProducts/anduhaw/fish/Tisa%20Cebu%20City/10.299952482992184/123.8698153951779
app.get('/api/userRecoProducts/:id/:type/:city/:lat/:long', async (req, res) => {
  const paramId = req.params.id
  const type = req.params.type
  const lat = req.params.lat
  const long = req.params.long
  const snapshot = await db.ref(`products`)

  snapshot.on('value', (snapshot) => {
    const products = snapshot.val()
    const userProducts = []
      for (let id in products) {
        if(((products[id]['title']).toLowerCase()).includes((paramId).toLowerCase()) && (products[id]['category']).toLowerCase()==type.toLowerCase() && products[id]['isListed']=='yes'){
          console.log(products[id])
          products[id]['productId']=id
          userProducts.push(products[id])
        }
      }
      res.status(200).send(JSON.stringify(userProducts))
    })
})

// @desc    Fetch all user products.
// @route   GET /api/endangeredspecies/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/shopsNearby/fish/cebu/10.299952482992184/123.8698153951779
app.get('/api/shopsNearby/:shopId/:shopType/:cityAddress/:lat/:long', async (req, res) => {
  const paramCity = req.params.cityAddress
  const lat = req.params.lat
  const long = req.params.long
  const shopId = req.params.shopId
  const shopType = req.params.shopType
  const snapshot = await db.ref(`user`)

  snapshot.on('value', (snapshot) => {
    const users = snapshot.val()
    console.log('parameter values:', paramCity, lat, long, shopId)
    const nearbyshop = []
      for (let id in users) {
        if(users[id]['storeAddressMap']!=undefined){
          if(users[id]['storeAddressMap']['city']!=undefined){
          if(((users[id]['storeAddressMap']['city']).toLowerCase()).includes((paramCity).toLowerCase()) && users[id]['uuid']!=shopId && (users[id]['type']).toLowerCase()==((shopType).toLowerCase()))
          {
            users[id]['locationDistance'] = calculateDistance(lat, long, users[id]['storeAddressMap']['lat'], users[id]['storeAddressMap']['lng'])
            nearbyshop.push(users[id])
          }}
        }
      }
    nearbyshop.sort((a,b) => a.locationDistance - b.locationDistance);
    res.status(200).send(JSON.stringify(nearbyshop))
    })
})

// @desc    Fetch all user products.
// @route   GET /api/endangeredspecies/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/shops/klmJxJJVQfhNiAsoRX0XKg24q603/tackle%20shop%20owner/cebu/10.299952482992184/123.8698153951779
app.get('/api/shops/:shopId/:shopType/:cityAddress/:lat/:long', async (req, res) => {
  const paramCity = req.params.cityAddress
  const lat = req.params.lat
  const long = req.params.long
  const shopId = req.params.shopId
  const shopType = req.params.shopType
  const snapshot = await db.ref(`user`)

  snapshot.on('value', (snapshot) => {
    const users = snapshot.val()
    console.log('parameter values:', paramCity, lat, long, shopId)
    const nearbyshop = []
      for (let id in users) {
        if(users[id]['storeAddressMap']!=undefined){
          if(users[id]['storeAddressMap']['city']!=undefined){
          if(((users[id]['storeAddressMap']['city']).toLowerCase()).includes((paramCity).toLowerCase()) && users[id]['uuid']!=shopId && ('tackle shop owner' == ((shopType).toLowerCase())))
          {
            users[id]['locationDistance'] = calculateDistance(lat, long, users[id]['storeAddressMap']['lat'], users[id]['storeAddressMap']['lng'])
            nearbyshop.push(users[id])
          }}
        }
      }
    nearbyshop.sort((a,b) => a.locationDistance - b.locationDistance);
    res.status(200).send(JSON.stringify(nearbyshop))
    })
})

// @desc    Fetch all user products.
// @route   GET /api/endangeredspecies/:id
//sample    http://localhost:5001/fishingbuddy-web/us-central1/app/api/getShops/fisherman
app.get('/api/getShops/:shopType', async (req, res) => {
  const shopType = req.params.shopType
  const snapshot = await db.ref(`user`)

  snapshot.on('value', (snapshot) => {
    const users = snapshot.val()
    const shops = []
      for (let id in users) {
        if(users[id]['storeAddressMap']!=undefined){
          if( (users[id]['type'].toLowerCase() == ((shopType).toLowerCase())))
          {
            shops.push(users[id])
          }
        }
      }
    res.status(200).send(JSON.stringify(shops))
    })
})

exports.app = functions.https.onRequest(app)
