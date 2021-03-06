const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Service = require('../models/Service');
//---------------All Post Methods-------------------

//-------------create service embedded in customer-------------------
router.post('/api/:customerId', (req, res) => {
  // store new Service in memory with data from request body
  const { ServiceType, ServiceDescription, ServiceState,ServicePrice } = req.body
  let service = {}
  service.ServiceDescription = ServiceDescription,
    service.ServiceState = ServiceState,
    service.ServicesEmp = req.params.customerId,
    service.ServiceType = ServiceType,
    service.ServicePrice = ServicePrice
  const savedService = new Service(service)
  savedService.save()
  // find Customer in db by id and add new service
  Customer.findById(req.params.customerId, async (error, foundCustomer) => {
    try {
      await foundCustomer.RequestService.push(savedService);
      foundCustomer.save()
      res.status(200).json(savedService);
    }
    catch (error) {
      res.status(404).json(error);
    }
  });
});

//--------------- All GET Methods -------------------\\

//------------- Find all service depend on WorkerId and if the ServiceState is open -------------
router.get('/api/service/:WorkerId', (req, res) => {
  Customer.findById(req.params.WorkerId, (error, foundWorker) => {
    let user_type = foundWorker.UserType
    Service.find({})
      .where('ServiceType').in(user_type)
      .where("ServiceState").in('Open')
      .populate('ServicesEmp')
      .exec((err, Customer) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        console.log(`found and populated all : ${Customer}`);
        res.status(200).json(Customer);
      })
  });

});

//Find all service depend on userId and if the ServiceState is closed
router.get('/api/Find/All/closed/Service/:UserId', (req, res) => {
  Customer.findById(req.params.UserId, (error, foundWorker) => {
    Service.find({$or:[{_id:foundWorker.RequestService},{_id:foundWorker.ReceivedService}]})
      .where("ServiceState").in('Closed')
      .exec((err, Customer) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        console.log(`found and populated all : ${Customer}`);
        res.status(200).json(Customer);
      })
    });
  });

//Find all service depend on userId and if the ServiceState is Waiting
router.get('/api/Find/All/Waiting/Service/:UserId', (req, res) => {
  Customer.findById(req.params.UserId, (error, foundWorker) => {
    Service.find({$or:[{_id:foundWorker.RequestService},{_id:foundWorker.ReceivedService}]})
      .where("ServiceState").in('Waiting')
      .exec((err, Customer) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        console.log(`found and populated all : ${Customer}`);
        res.status(200).json(Customer);
      })
  });
});

//Find all service depend on userId and if the ServiceState is On Progress
router.get('/api/Find/All/OnProgress/Service/:UserId', (req, res) => {
  Customer.findById(req.params.UserId, (error, foundWorker) => {
    Service.find({$or:[{_id:foundWorker.RequestService},{_id:foundWorker.ReceivedService}]})
      .where("ServiceState").in('OnProgress')
      .exec((err, Customer) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        console.log(`found and populated all : ${Customer}`);
        res.status(200).json(Customer);
      })
  });
});


//--------------- All Patch Methods -------------------\\
//this rout response to Find Service By ServiceId and Update the Price
//depend On User who Add the Price to the Service and Update AllPrice
//with New Price that Worker add with his information
router.patch('/api/PassService/:ServiceId', (req, res) => { 
  Service.findById(req.params.ServiceId, async (error, foundService) => {
    try {
      await foundService.AllPrice.push(req.body)
    } catch (error) {
      res.status(404).json(error);
    }
    Customer.findById(req.body.ServicesEmp, async (error, foundCustomer) => {
      try { 
       await foundService.save()
       foundCustomer.ReceivedService.push(foundService);
       foundCustomer.save()
        res.status(200).json(foundService);
      } catch (error) {
        res.status(404).json(error);
      }
    })
  
  });
});

//Update Service by Service Id
router.patch('/api/UpdateService/:ServiceId', (req, res) => {
    Service.findById(req.params.ServiceId, async (error, foundService) => {
      try {
        await foundService.update(req.body);
        res.status(200).json(req.body);
      } catch (error) {
        res.status(404).json(error);
      }
    });
  });




//--------------- All Delete Methods -------------------\\


//Delete Service by Service Id
router.delete('/api/DeleteService/:ServiceId', (req, res) => {
    Service.findById(req.params.ServiceId, async (error, foundService) => {
      try {
        await foundService.remove();
        res.status(200).json(`Service Id:  ${req.params.ServiceId} has been deleted `);
      } catch (error) {
        res.status(404).json({
          error: {
            name: 'DocumentNotFound',
            massage: 'The provided ID dose not match any Document on Service'
          }
        });
      }
    });
  });
  
  
  
  
  module.exports = router