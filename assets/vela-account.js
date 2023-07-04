window.account = window.account || {};

account.init = function () {
  account.customer();
};

account.customerAddress = [];

account.customer = function () {
  var customer = getCustomer();
  var $payment = $('.accountPayment');
  var $accountDetails = $('.accountInfo');
  var $billingAddress = $('.accountBillingAddress');
  var $shippingAddress = $('.accountShippingAddress');
  var $subscriptionBox = $('.accountSubscriptionBox .subscriptionBoxContent');

  //var stripe = Stripe('pk_test_qztSYeedXOL4lfHuJr3VfZZp');
  var stripe = Stripe('pk_live_R7aDpBgftpyrmVZyLOkTId7k');
  var elements = stripe.elements();
  var cardElement = elements.create('card');
  var cardElement = elements.getElement('card');
  var displayError = document.getElementById('card-errors');
  
  var currentCustomerData = null;
  var newlySelectedBoxData = null;
  var newlySelectedSizeData = null;
  var newlySelectedPlanData = null;
  var newlySelectedColorData = null;
  
  var disableSkip = false;
  
  var totalSubscriptionSkips = 0,
      currentSkipLogId		 = null,
      currentSkipLog		 = null;
  

  cardElement.mount('#card-element');
  cardElement.on('change', function(event) {
    if (event.error) {
      //displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
      stripe.createToken(cardElement).then(function(result) {
        if(result.error != undefined){
          displayError.textContent = result.error.message;
          $('.paymentUpdateBtn').attr('disabled', true);
        }
        //console.log(result);
        if(result.token != undefined){
          //console.log(result);
          //console.log(result.token);
          //console.log(result.token.id);
          displayError.textContent = '';
          $('#payment_token').val(result.token.id);
          $('.paymentUpdateBtn').attr('disabled', false);
        }
      });
    }
  });
  
  
  
  //setDetails(customer);
  function generateBillingDetails(customer, address_id){
    //console.log(customer);
    var billingAddress = '<li>'+customer.billing_address1+' '+customer.billing_address2+'</li>';
    billingAddress += '<li>'+customer.billing_city+' '+customer.billing_province+' '+customer.billing_zip+'</li>';
    billingAddress += '<li>'+customer.billing_country+'</li>';
    billingAddress += '<li>'+customer.billing_phone+'</li>';
    $billingAddress.find('.accountContent').html('<ul class="addressInfo list-unstyled">'+billingAddress+'</ul>');
    $billingAddress.removeClass('hide');
    
    var $billingPopup = $('#billingAddressPopup');
    
    var billingForm = '';
    billingForm += "<div class='form-input'><label for='first_name'>First Name</label><input id='first_name' name='first_name' value='"+customer.first_name+"'></div>";
    billingForm += "<div class='form-input'><label for='last_name'>Last Name</label><input id='last_name' name='last_name' value='"+customer.last_name+"'></div>";
    billingForm += "<div class='form-input'><label for='billing_address1'>Address</label><input id='billing_address1' name='billing_address1' value='"+customer.billing_address1+"'></div>";
    billingForm += "<div class='form-input'><label for='billing_address2'>Apt, suite, etc. (optional)</label><input id='billing_address2' name='billing_address2' value='"+customer.billing_address2+"'></div>";
    billingForm += "<div class='form-input'><label for='billing_city'>City</label><input id='billing_city' name='billing_city' value='"+customer.billing_city+"'></div>";
    billingForm += "<div class='form-input'><label for='billing_zip'>Zip</label><input id='billing_zip' name='billing_zip' value='"+customer.billing_zip+"'></div>";
    billingForm += "<div class='form-input'><label for='billing_province'>State</label><input id='billing_province' name='billing_province' value='"+customer.billing_province+"'></div>";
    billingForm += "<div class='form-input'><label for='billing_country'>Country</label><input id='billing_country' name='billing_country' value='"+customer.billing_country+"'></div>";
    billingForm += "<div class='form-input'><label for='billing_phone'>Phone</label><input id='billing_phone' name='billing_phone' value='"+customer.billing_phone+"'></div>";
    billingForm += "<div class='form-input'><input type='checkbox' id='for_shipping' name='is_shipping' value='true' ><label for='for_shipping'>Save for Shipping too?</label></div>";
    if (!!address_id) {
    billingForm += "<input type='hidden' name='customer_id' value='"+customer.id+"'><input type='hidden' name='address_id' id='address_id' value='"+address_id+"'><input type='hidden' name='type' class='type' value='billing_address'>";
    } else {
    billingForm += "<input type='hidden' name='customer_id' value='"+customer.id+"'><input type='hidden' name='type' class='type' value='billing_address'>";
    }
    $billingPopup.html('<h3>Billing Address Details</h3><form class="recharge_forms">'+billingForm+'<button type="submit" class="btn">Update</button></form>');
  }
  
  function generateAccountDetails(customer){
    var accountDetails = '<li>'+customer.first_name+' '+customer.last_name+'</li>';
    accountDetails += '<li>'+customer.email+'</li>';
    $accountDetails.find('.accountContent').html('<ul class="addressInfo list-unstyled">'+accountDetails+'</ul>');
    
    $('.accTitleLeft .customerName').text(customer.first_name+' '+customer.last_name);
    
    var $accountPopup = $('#accountPopup');
    var accountForm = "";
    accountForm += "<div class='form-input'><label for='first_name'>First Name</label><input id='first_name' name='first_name' value='"+customer.first_name+"'></div>";
    accountForm += "<div class='form-input'><label for='last_name'>Last Name</label><input id='last_name' name='last_name' value='"+customer.last_name+"'></div>";
    accountForm += "<div class='form-input'><label for='email'>Email</label><input id='email' name='email' value='"+customer.email+"'></div>";
    accountForm += "<input type='hidden' name='customer_id' value='"+customer.id+"'><input type='hidden' name='type' class='type' value='billing_address'>";
    $accountPopup.html('<h3>My Info</h3><form class="recharge_forms" autocomplete="off">'+accountForm+'<button type="submit" class="btn">Update</button></form>');
    
    $('.rechargeCustomerDetail').html("<input type='hidden' name='customer_id' value='"+customer.id+"'>");
  }
  
  function generateShippingDetails(address){
    //console.log(address);
    var shippingAddress = '<li>'+address.address1+' '+address.address2+'</li>';
    shippingAddress += '<li>'+address.city+' '+address.province+' '+address.zip+'</li>';
    shippingAddress += '<li>'+address.country+'</li>';
    shippingAddress += '<li>'+address.phone+'</li>';
    $shippingAddress.find('.accountContent').html('<ul class="addressInfo list-unstyled">'+shippingAddress+'</ul>');
    $shippingAddress.removeClass('hide');
    
    var $shippingPopup = $('#shippingAddressPopup');
    
    var shippingForm = '';
    shippingForm += "<div class='form-input'><label for='first_name'>First Name</label><input required id='first_name' name='first_name' value='"+address.first_name+"'></div>";
    shippingForm += "<div class='form-input'><label for='last_name'>Last Name</label><input required id='last_name' name='last_name' value='"+address.last_name+"'></div>";
    shippingForm += "<div class='form-input'><label for='address1'>Address 1</label><input required id='address1' name='address1' value='"+address.address1+"'></div>";
    shippingForm += "<div class='form-input'><label for='address2'>Address 2</label><input id='address2' name='address2' value='"+address.address2+"'></div>";
    shippingForm += "<div class='form-input'><label for='city'>City</label><input required id='city' name='city' value='"+address.city+"'></div>";
    shippingForm += "<div class='form-input'><label for='zip'>Zip</label><input required id='zip' name='zip' value='"+address.zip+"'></div>";
    shippingForm += "<div class='form-input'><label for='province'>State/province</label><input required id='province' name='province' value='"+address.province+"'></div>";    
    shippingForm += "<div class='form-input'><label for='country'>Country</label><input required id='country' name='country' value='"+address.country+"'></div>";
    shippingForm += "<div class='form-input'><label for='phone'>Phone</label><input required id='phone' name='phone' value='"+address.phone+"'></div>";
    shippingForm += "<div class='form-input ebyCheckboxFieldRow'><input type='checkbox' id='for_billing' name='is_billing' value='true' ><label for='for_billing'>Save for Billing too?</label></div>";
    if (!!address.id) {
        shippingForm += "<input type='hidden' name='customer_id' value='"+address.customer_id+"'><input type='hidden' name='address_id' value='"+address.id+"'><input type='hidden' name='type' class='type' value='shipping_address'>";
    } else {
    	shippingForm += "<input type='hidden' name='customer_id' value='"+address.customer_id+"'><input type='hidden' name='type' class='type' value='shipping_address'>";
    }
    $shippingPopup.html('<h3>Shipping Address Details</h3><form class="recharge_forms"><div class="error hvr-buzz-out"></div>'+shippingForm+'<button type="submit" class="btn">Update</button></form>');        
  }

  /**
  *
  * determine the box type, date range, current date.
  * @customer(obj) => assumed to have subscription property
  * 
  **/
  function validateBlackoutPeriod (customer) {

  	var blackoutStatus = false;

    var getSubType = function(subscription) {
      	if (!!customer.subscription.sku) {
      		return customer.subscription.sku.slice(0, 2) === 'CB' ? 'cb' : 's&d';
        } else {
          return customer.subscription.product_title.indexOf('Custom') >= 0 ? 'cb' : 's&d';
        }
    };
    
  	var subType = getSubType(customer.subscription),
    	currDate = new Date(),
  		currMon = currDate.getMonth() + 1,
  		currDay = currDate.getDate();

  	var renewalDate = new Date(customer.next_charge.scheduled_at),
  		renewalMon = renewalDate.getMonth() + 1,
  		renewalDay = renewalDate.getDate();

  	var sdBlackoutDay = renewalDay - 2,
      	cbBlackoutDay = 30;
    

  	if (subType === 'cb') {
  		if (currMon === renewalMon && currDate.getFullYear() === renewalDate.getFullYear()) {
	  		// renewal month

// 	  		if (currDay < cbBlackoutDay) {
// 	  			blackoutStatus = false;

// 	  		} else {
// 	  			// blackout active
// 	  			blackoutStatus = true;
// 	  		}
          
            if (renewalDate.getDate() - currDay === 1 && customer.next_charge.line_items.length > 1) {
              //order placed already
              blackoutStatus = true;
            }


  		} else {
  			// not renewing this month and/or year
  			blackoutStatus = false;
  		}

  	} else {
  		if (currMon === renewalMon && currDate.getFullYear() === renewalDate.getFullYear()) {
	  		// renewal month

	  		if (currDay < sdBlackoutDay) {
	  			blackoutStatus = false;

	  		} else {
	  			// blackout active
	  			blackoutStatus = true;
	  		}

  		} else {
  			// not renewing this month and/or year
  			blackoutStatus = false;
  		}

  	}

  	return blackoutStatus;

  }

  /**
  *
  * determine the box type and if custom box selection is possible.
  * @customer(obj) => assumed to have subscription property
  * @return(obj)
  **/
  function isSelectionOpen (customer) {

  	var selectionStatus = false;

  	var currDate = new Date(),
  		currMon = currDate.getMonth() + 1,
  		currDay = currDate.getDate();
    
    var getSubType = function(subscription) {
      	if (!!customer.subscription.sku) {
      		return customer.subscription.sku.slice(0, 2) === 'CB' ? 'cb' : 's&d';
        } else {
          return customer.subscription.product_title.indexOf('Custom') >= 0 ? 'cb' : 's&d';
        }
    };

  	var subType = getSubType(customer.subscription),
  		renewalDate = new Date(customer.next_charge.scheduled_at),
  		renewalMon = renewalDate.getMonth() + 1,
  		renewalDay = renewalDate.getDate();
    

  	if (subType === 'cb') {
  		if (currMon === renewalMon && currDate.getFullYear() === renewalDate.getFullYear()) {
	  		// renewal month
			selectionStatus = true;
          
  		} else {
  			// not renewing this month and/or year
  			selectionStatus = false;
  		}

  	} else {
  		selectionStatus = false;
  	}

    return {
      isCustom: subType === 'cb',
      isOpen: selectionStatus
    };

  }
  
  /* create 'my membership' section */
  function setDetails(customer){
    console.log(":: setDetails init, customer data ::", customer);
    //rechargeAccountDetail
    //console.log(customer.customer.stripe_customer_token);
    window.currentMembership = customer.subscription.product_title;
    window.currentBoxPrice = customer.subscription.price;
    window.currentBoxVarId = customer.subscription.shopify_variant_id;
    window.currentPlan = "";
    
    var subscriptionHtml = '',
    	subscriptionProduct, subscriptionVariant, subscriptionProducts = customer.products, customProductsList = [],
    	subscriptionDetail = customer.subscription,
    	nextChargeDetail = "",
        hasSubscription = false,
        isBlackoutActive = false;
    
    if (!!subscriptionDetail){
      	hasSubscription = true;
    	var nextChargeDetail = customer.subscription.next_charge_scheduled_at;
    	/* eby - blackout */
    	isBlackoutActive = validateBlackoutPeriod(customer);
    }
    
    if (!!hasSubscription) {
		$(subscriptionProducts).each(function(k,v){
          if(v.id == subscriptionDetail.shopify_product_id){
            // define current subscription
            subscriptionProduct = v;

            $(v.variants).each(function(key,val){
              if(val.id == subscriptionDetail.shopify_variant_id){
                subscriptionVariant = val;
              }
            });
          }else{
            //console.log(v);
            if(v.product_type == "Core Underwear"){
              customProductsList.push(v);
            }
          }
        });
    }

    var paymenrDetailsArr = customer.payment;
    if (!!paymenrDetailsArr.card_brand) {
        var paymentDetail = '<li>'+paymenrDetailsArr.card_brand+' •••• '+paymenrDetailsArr.card_last4+'</li>';
        paymentDetail += '<li>'+paymenrDetailsArr.cardholder_name+'</li>';
        paymentDetail += '<li>Expires '+ ("0" + paymenrDetailsArr.card_exp_month).slice(-2)+'/'+ paymenrDetailsArr.card_exp_year +'</li>';
        $payment.find('.accountContent').html('<ul class="addressInfo list-unstyled">'+paymentDetail+'</ul>');
    } else {
        var paymentDetail = '<li>Invalid Card</li>';
        paymentDetail += '<li>Please provide a valid card.</li>';
        paymentDetail += '<li>Next Box On Hold</li>';
        $payment.find('.accountContent').html('<ul class="addressInfo list-unstyled">'+paymentDetail+'</ul>');

        // if there is a card issue, it must be fixed first
        isBlackoutActive = true;
    }

    $payment.removeClass('hide');
    
    //console.log(subscriptionProduct);
    //console.log(customProductsList);
    
    if(subscriptionProduct != undefined){
      //$.cookie("subscription_status", "true", { expires: 1 });
      var selection = [];
      var title = subscriptionProduct.title;
      
      if(title.includes("Thongs")){var box = "All Thongs Box";}
      if(title.includes("Briefs")){var box = "All Briefs Box";}
      if(title.includes("Highwaisted")){var box = "All Highwaisted Box";}
      if(title.includes("Full Coverage")){var box = "Full Coverage Box";}
      if(title.includes("Mixed Styles")){var box = "Mixed Styles Box";}
      if(title.includes("Custom")){var box = "Custom Box";}
      if(box == "Custom Box"){
        //selection.push('style=custom_box');
        selection.push('style=custom_box');
      }else{
        //selection.push('style='+ box.replace(new RegExp(' ', 'g'), '_'));
        selection.push('style='+ box.replace(new RegExp(' ', 'g'), '_'));
      }
      
      var t, size = subscriptionDetail.variant_title;
      window.currentSubSize = subscriptionDetail.variant_title;
      switch (size.toUpperCase()) {
        case 'XS': t = "XS"; break;
        case 'SM': t = "Small"; break;
        case 'MD': t = "Medium"; break;
        case 'LG': t = "Large"; break;
        case 'XL': t = "XL"; break;
        case '1X': t = "1X"; break;
        case '2X': t = "2X"; break;
        case '3X': t = "3X"; break;
        case '4X': t = "4X"; break;
      }
      selection.push('size='+size.toUpperCase());
      
      if(title.includes("in Mixed")){var color = "Mixed Colors";}
      if(title.includes("in Neutrals")){var color = "Only Neutrals";}
      if(color != undefined){
        selection.push('color='+color);
      }
      
      if(title.includes("Quarterly")){
        var plan = "<u>3 Panties</u> Delivered <u>Every 3 Months</u>";
        selection.push('plan=Every 3 Months');
        window.currentPlan = 3;
      }
      if(title.includes("Semi Annual") || title.includes("Semi-Annual")){
        var plan = "<u>5 Panties</u> Delivered <u>Every 6 Months</u>";
        selection.push('plan=Every 6 Months');
        window.currentPlan = 6;
      }

      var boxPricing = Shopify.formatMoney(customer.next_charge.total_line_items_price, window.money).replace(".00", ""),
      	  date = new Date(nextChargeDetail),
          skippedDate = customer.next_charge.status = "SKIPPED" ? new Date(customer.subscription.next_charge_scheduled_at) : null;
      
      var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
      var nextDate = months[date.getMonth()]+' '+date.getFullYear();      
      
//       if (customer.next_charge.status == "SKIPPED") {
//       	boxPricing = '<span>Now Renews on: '+ months[skippedDate.getMonth()] + ', ' + skippedDate.getFullYear() +', ' + Shopify.formatMoney(customer.next_charge.total_line_items_price, window.money).replace(".00", "") + '</span>';
//         nextDate = 'Skipped'; 
//       }
      
      selection.push('id='+subscriptionDetail.id);
      
      /* begin */
      
      var editLink = '/pages/build-your-box?'+selection.join('&');
      var customProductHTML = "";
      if(title.includes("Custom")){
        var packInfo = t;
        
        if (customer.oneTimeProducts.length <= 0) {
        	customProductHTML += "<li class='non-item'><p>You can choose what you want inside beginning on "+ nextDate.split(' ')[0] +" 1st.</p></li>";
        } else {
          var hasInsert = false;
        	$(customer.oneTimeProducts).each(function(key,product){
              var productTitle = product.product_title;
              //var productImg = product.product_handle
              console.log(':: products selected ::', product);

              if (productTitle.toLowerCase().indexOf("insert") >= 0) {
                hasInsert = true;

                return;
              }

              var number = key;

              if (hasInsert === false) {
                number = number + 1;
              }

              customProductHTML += "<li><p>"+productTitle+", in "+ product.variant_title +"</p></li>";
            });
        }
        
        customProductHTML = '<div class="ebyCustomBoxDetails"><ul>'+customProductHTML+'</ul></div>';
      }else{
        var packInfo = t+', '+color;
        
        if (!!customer.oneTimeProducts) {
          if (customer.oneTimeProducts.length > 0) {
          	var hasInsert = false;
        	$(customer.oneTimeProducts).each(function(key,product){
              var productTitle = product.product_title;
              //var productImg = product.product_handle;
              console.log(':: products selected ::', product);

              if (productTitle.toLowerCase().indexOf("insert") >= 0) {
                hasInsert = true;

                return;
              }

              var number = key;

              if (hasInsert === false) {
                number = number + 1;
              }

              customProductHTML += "<li><p>"+productTitle+", in "+ product.variant_title +"</p></li>";
            });
            customProductHTML = '<div class="ebyCustomBoxDetails"><ul>'+customProductHTML+'</ul></div>';
          }
        }
        
      }
      
      var status = !!customer.charge ? customer.charge.status : customer.subscription.status;
      var skpBtn = '';

      if (customer && customer.next_charge && customer.next_charge.id) {
        var customerChargeId = customer.next_charge.id;

        //skpBtn = '<button class="ebySkipbtn btn" data-type="skip" data-subscription="'+subscriptionDetail.id+'" data-id="'+ customerChargeId +'">Skip</button>';
      }

      var s = '';
      if(subscriptionDetail.status == 'ACTIVE'){
        if (!!nextChargeDetail) {
          
          if (!!isBlackoutActive) {
          
            //var tryABralette = '<article class="mybox-block"><div class="featColWrapper"><div class="featCol imgCol"><img class="featImg" title="Try a Bralette Box" alt="Try a Bralette Box" src="https://cdn.shopify.com/s/files/1/0313/4062/5964/files/feed---bralette_adjustable---black.jpg"/></div><div class="featCol"><span class="newFeatCallOutCopy">New!</span><p>Try a bralette in this month\'s box in place of panties</p></div></div><div class="buttonWrapper"><a class="btn newFeatBtn selectBraletteSubscriptionBtn ebyFancyBtn" data-src="#selectMyBralettePopup" href="javascript:;" data-type="select_bralette">Choose A Bralette Instead</a></div></article>';
//             if (customProductHTML !== "") {
//             	s = '<div class="ebyBoxUpcoming newFeatWrapper buttonWrapper"><span>My Box</span>'+customProductHTML+'</div><div class="ebyBoxUpcoming"><span>Next Box</span><h4 class="ebyNextDate preppingOrder">Order Processing</h4><a href="javascript:void(0);" class="ebyChangeDatebtn" >Change Date</a><div class="date-field hide"><form type="get" class="updateRechargeDate"><div class="input-group"><input class="form-control date" id="date" name="date" value="'+nextChargeDetail.scheduled_at+'" type="text"/></div>';
//             } else {
//                 s = '<div class="ebyBoxUpcoming newFeatWrapper buttonWrapper"><span>My Box</span><p class="mybox-prompt">Sit back and relax. We\'ll curate your box just how you like it!</p></div><div class="ebyBoxUpcoming"><span>Next Box Arrives</span>'+skpBtn+'<h4 class="ebyNextDate">'+nextDate+' - '+ boxPricing +'</h4><a href="javascript:void(0);" class="ebyChangeDatebtn" >Change Date</a><div class="date-field hide"><form type="get" class="updateRechargeDate"><div class="input-group"><input class="form-control date" id="date" name="date" value="'+nextChargeDetail.scheduled_at+'" type="text"/></div>';
//             }
            s = '<div class="ebyBoxUpcoming newFeatWrapper"><span>My Box</span>'+customProductHTML+'</div><div class="ebyBoxUpcoming"><span>Next Box</span><h4 class="ebyNextDate preppingOrder">Order Processing</h4><a href="javascript:void(0);" class="ebyChangeDatebtn" >Change Date</a><div class="date-field hide"><form type="get" class="updateRechargeDate"><div class="input-group"><input class="form-control date" id="date" name="date" value="'+nextChargeDetail.scheduled_at+'" type="text"/></div>';
            
        	s += '<input name="type" class="type" type="hidden" value="change_date"><input name="id" class="id" type="hidden" value="'+nextChargeDetail.id+'"><button type="submit" class="btn">Update</button></form></div></div>';
          
          } else {
            //if current month is not renewal month
          	var currDate = new Date();
          	var renewData = new Date(subscriptionDetail.next_charge_scheduled_at);
          	var subPlanInt = subscriptionDetail.order_interval_frequency;
            var newRenewalMonth = renewData.getMonth() + +subPlanInt;
            var newRenewalYear = renewData.getFullYear();
            if (newRenewalMonth > 11) {
            	newRenewalMonth = newRenewalMonth - 12;
              	newRenewalYear  = renewData.getFullYear() + 1;
            }
          	var newRenewDate = new Date(newRenewalYear, newRenewalMonth, 10);
            
            var timeOffset = newRenewDate.getTimezoneOffset();
            newRenewDate = new Date(newRenewDate.getTime() - (timeOffset*60*1000));
            var formattedNewRenewalDate = newRenewDate.toISOString().split('T')[0];
            
            //console.log("::  ::", newRenewDate);
            
            //console.log(":: when is next box if skipped? ::",formattedNewRenewalDate);
            if (!disableSkip) {
                if (currDate.getMonth() !== renewData.getMonth() || currDate.getFullYear() !== newRenewalYear) {
                  skpBtn = '<button class="btn" id="skip-popup-btn">Skip Box</button><div class="skip-popup hide" id="skip-popup" aria-label="Skip"><div class="popup-wrapper"><div class="popup-content"><button id="skip-close-popup-btn" aria-label="Close popup"></button><h2>Have too many EBYs?</h2><p>Click below to skip your next box renewal. Your next order will arrive in ' + newRenewDate.toLocaleString('default', { month: 'long' }) + '.</p><button class="ebySkipBtn btn" aria-label="Skip" data-type="skip" data-chargeid="'+customer.next_charge.id+'" data-subid="'+subscriptionDetail.id+'" data-new_date="'+formattedNewRenewalDate+'">Skip Next Box</button></div><img src="https://cdn.shopify.com/s/files/1/0313/4062/5964/files/480_-_PROD_-_subscription_-_default.jpg" class="popup-image lazyloaded"></div></div>';	
                }
            }

            //var tryABralette = '<article class="mybox-block"><div class="featColWrapper"><div class="featCol imgCol"><img class="featImg" title="Try a Bralette Box" alt="Try a Bralette Box" src="https://cdn.shopify.com/s/files/1/0313/4062/5964/files/feed---bralette_adjustable---black.jpg"/></div><div class="featCol"><span class="newFeatCallOutCopy">New!</span><p>Try a bralette in this month\'s box in place of panties</p></div></div><div class="buttonWrapper"><a class="btn newFeatBtn selectBraletteSubscriptionBtn ebyFancyBtn" data-src="#selectMyBralettePopup" href="javascript:;" data-type="select_bralette">Choose A Bralette Instead</a></div></article>';
            if (customProductHTML !== "") {

              console.log(': correct :', {
                month: currDate.getMonth(),
                reMonth: renewData.getMonth(),
                curYear : currDate.getFullYear(),
                reYear : newRenewalYear
              });
              
              	if (currDate.getMonth() == renewData.getMonth() && currDate.getFullYear() == renewData.getFullYear()) {
                  
                  	if (window.currentPlan === 3) {
                  		var tryABralette = '<article class="mybox-block"><div class="featColWrapper"><div class="featCol imgCol"><img class="featImg" title="Try a Bralette Box" alt="Try a Bralette Box" src="https://cdn.shopify.com/s/files/1/0313/4062/5964/files/feed---bralette_adjustable---black.jpg"/></div><div class="featCol"><span class="newFeatCallOutCopy">New!</span><p>Try a bralette this month instead!</p></div></div><div class="buttonWrapper"><a class="btn newFeatBtn selectBraletteSubscriptionBtn ebyFancyBtn" data-src="#selectMyBralettePopup" href="javascript:;" data-type="select_bralette">Select 1 Bralette</a><p class="btnSplitText">or</p><a href="https://shop.join-eby.com/collections/build-your-custom-box" class="ebyEditQuizbtn btn newFeatBtn">Select '+window.currentPlan+' panties</a></div></article>';
                    } else {
                    	var tryABralette = '<article class="mybox-block"><div class="buttonWrapper"><a href="https://shop.join-eby.com/collections/build-your-custom-box" class="ebyEditQuizbtn btn newFeatBtn">Select 5 panties</a></div></article>';
                    }
                  
                  console.log(': correct :');
                  	
              		s = '<div class="ebyBoxUpcoming newFeatWrapper"><span>My Box</span><p class="mybox-prompt"><b>Time to make your selections!</b> Choose what you would like in this box.</p>'+ tryABralette +'</div><div class="ebyBoxUpcoming"><span>Next Box Arrives</span>'+skpBtn+'<h4 class="ebyNextDate">'+nextDate+' - '+ boxPricing +'</h4><a href="javascript:void(0);" class="ebyChangeDatebtn" >Change Date</a><div class="date-field hide"><form type="get" class="updateRechargeDate"><div class="input-group"><input class="form-control date" id="date" name="date" value="'+nextChargeDetail.scheduled_at+'" type="text"/></div>';
                } else {
                	s = '<div class="ebyBoxUpcoming newFeatWrapper"><span>My Box</span>'+customProductHTML+'</div><div class="ebyBoxUpcoming"><span>Next Box Arrives</span>'+skpBtn+'<h4 class="ebyNextDate">'+nextDate+' - '+ boxPricing +'</h4><a href="javascript:void(0);" class="ebyChangeDatebtn" >Change Date</a><div class="date-field hide"><form type="get" class="updateRechargeDate"><div class="input-group"><input class="form-control date" id="date" name="date" value="'+nextChargeDetail.scheduled_at+'" type="text"/></div>';
                }
              	
            } else {
              	if (currDate.getMonth() == renewData.getMonth() && currDate.getFullYear() == newRenewalYear) {
					if ((window.currentSubSize === 'md' || window.currentSubSize === 'lg') && window.currentPlan === 3) {
                  		var tryABralette = '<article class="mybox-block"><div class="featColWrapper"><div class="featCol imgCol"><img class="featImg" title="Try a Bralette Box" alt="Try a Bralette Box" src="https://cdn.shopify.com/s/files/1/0313/4062/5964/files/feed---bralette_adjustable---black.jpg"/></div><div class="featCol"><span class="newFeatCallOutCopy">New!</span><p>Try a bralette this month instead!</p></div></div><div class="buttonWrapper"><a class="btn newFeatBtn selectBraletteSubscriptionBtn ebyFancyBtn" data-src="#selectMyBralettePopup" href="javascript:;" data-type="select_bralette">Choose A Bralette Instead</a></div></article>';
                    } else {
                    	var tryABralette = '<article class="mybox-block"><div class="buttonWrapper"><a class="btn newFeatBtn selectBraletteSubscriptionBtn ebyFancyBtn" data-src="#selectMyBralettePopup" href="javascript:;" data-type="select_bralette">Choose A Bralette Instead</a></div></article>';
                    }
                  
                  	s = '<div class="ebyBoxUpcoming newFeatWrapper"><span>My Box</span><p class="mybox-prompt">Sit back and relax. We\'ll curate your box just how you like it!</p>'+ tryABralette +'</div><div class="ebyBoxUpcoming"><span>Next Box Arrives</span>'+skpBtn+'<h4 class="ebyNextDate">'+nextDate+' - '+ boxPricing +'</h4><a href="javascript:void(0);" class="ebyChangeDatebtn" >Change Date</a><div class="date-field hide"><form type="get" class="updateRechargeDate"><div class="input-group"><input class="form-control date" id="date" name="date" value="'+nextChargeDetail.scheduled_at+'" type="text"/></div>';                  
                } else {
                	s = '<div class="ebyBoxUpcoming newFeatWrapper"><span>My Box</span><p class="mybox-prompt">Sit back and relax. We\'ll curate your box just how you like it!</p></div><div class="ebyBoxUpcoming"><span>Next Box Arrives</span>'+skpBtn+'<h4 class="ebyNextDate">'+nextDate+' - '+ boxPricing +'</h4><a href="javascript:void(0);" class="ebyChangeDatebtn" >Change Date</a><div class="date-field hide"><form type="get" class="updateRechargeDate"><div class="input-group"><input class="form-control date" id="date" name="date" value="'+nextChargeDetail.scheduled_at+'" type="text"/></div>';
                }
            }
            
          	s += '<input name="type" class="type" type="hidden" value="change_date"><input name="id" class="id" type="hidden" value="'+nextChargeDetail.id+'"><button type="submit" class="btn">Update</button></form></div></div>';
          }
        
        } else {
        	s = '<div class="ebyBoxUpcoming"><span>Next Box</span><h4 class="ebyNextDate">On Hold, Please Update Card</h4></div>';
        }
      }else{
        // status handling
        if (subscriptionDetail.status === "CANCELLED") {
          var now = new Date();
          if (now.getMonth() == 11) {
              var current = new Date(now.getFullYear() + 1, 0, 1);
          } else {
              var current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          }

          s = '<div class="ebyBoxUpcoming"><span>Next Box</span><h4 class="statusAlert">Canceled</h4><span class="canceledMembershipNotice">* Reactivate at any time to start box deliveries and enjoy VIP discounts again.</span><button class="btn" id="reactivate-popup-btn">Reactivate</button><div class="reactivate-popup hide" id="reactivate-popup" aria-label="Reactivate"><div class="popup-wrapper"><div class="popup-content"><button id="close-popup-btn" aria-label="Close popup"></button><h2>Miss your EBYs?</h2><p>Click below to reactivate your membership. Your next order will arrive in ' + current.toLocaleString('default', { month: 'long' }) + '.</p><button class="ebyReactivateBtn btn" aria-label="Reactivate" data-type="reactivate" data-id="'+subscriptionDetail.id+'">Reactivate</button><span class="reactivateBillingNotice">You will not be billed immediately.</span></div><img src="https://cdn.shopify.com/s/files/1/0313/4062/5964/files/480_-_PROD_-_subscription_-_default.jpg" class="popup-image lazyloaded"></div></div></div>';
        } else {
          s = '<div class="ebyBoxUpcoming"><span>Next Box Arrives</span><h4 class="statusAlert">'+subscriptionDetail.status+'</h4></div>';
        }
          
      }
      
      subscriptionHtml += '<div class="ebySubscriptionDetail">';
      var editButtons = '';
      
      if (!!isBlackoutActive) {
      	subscriptionHtml += '<div class="ebyBoxDetails"><div class="ebyDashSubHeader"><span class="membershipStatusCopy active">Active</span><h3>'+box+'</h3></div><span class="ebyColor">'+packInfo+'</span><p class="ebyPlan">'+plan+'</p></div>';
      } else {
        if (subscriptionDetail.status == 'ACTIVE') {
          
          	// check if custom_box and if they are ready for selections
          	if (title.includes("Custom")) {
          		var canMakeSelections = isSelectionOpen(customer);
              	if (!!canMakeSelections.isOpen) {
                  	var dashSummaryProf = selection;
              		subscriptionHtml += '<div class="ebyBoxDetails"><div class="ebyDashSubHeader"><div class="ebyStatusBar"><span class="membershipStatusCopy active">Active</span><a class="ebyEditQuizbtn btn changeMyBoxPopupBtn ebyFancyBtn" data-src="#changeMyBoxPopup" href="javascript:;"" data-type="change_box" data-value="'+dashSummaryProf+'" >Change Box</a><a class="ebyEditQuizbtn btn changeMyPreferencesPopupBtn ebyFancyBtn" data-src="#changeMyPrefsPopup" href="javascript:;" data-type="change_prefs" data-value="'+dashSummaryProf+'" >Settings</a></div><h3>'+box+'</h3></div><span class="ebyColor">'+packInfo+'</span><p class="ebyPlan">'+plan+'</p></div>';
                  	editButtons = '<div class="edit-buttons"></div>';
                } else {
                    var dashSummaryProf = selection;
                	subscriptionHtml += '<div class="ebyBoxDetails"><div class="ebyDashSubHeader"><div class="ebyStatusBar"><span class="membershipStatusCopy active">Active</span><a class="ebyEditQuizbtn btn changeMyBoxPopupBtn ebyFancyBtn" data-src="#changeMyBoxPopup" href="javascript:;"" data-type="change_box" data-value="'+dashSummaryProf+'" >Change Box</a><a class="ebyEditQuizbtn btn changeMyPreferencesPopupBtn ebyFancyBtn" data-src="#changeMyPrefsPopup" href="javascript:;" data-type="change_prefs" data-value="'+dashSummaryProf+'" >Settings</a></div><h3>'+box+'</h3></div><span class="ebyColor">'+packInfo+'</span><p class="ebyPlan">'+plan+'</p></div>';  
                	editButtons = '<div class="edit-buttons"></div>';
                }
                
            } else {
              	var dashSummaryProf = selection;
          		subscriptionHtml += '<div class="ebyBoxDetails"><div class="ebyDashSubHeader"><div class="ebyStatusBar"><span class="membershipStatusCopy active">Active</span><a class="ebyEditQuizbtn btn changeMyBoxPopupBtn ebyFancyBtn" data-src="#changeMyBoxPopup" href="javascript:;"" data-type="change_box" data-value="'+dashSummaryProf+'" >Change Box</a><a class="ebyEditQuizbtn btn changeMyPreferencesPopupBtn ebyFancyBtn" data-src="#changeMyPrefsPopup" href="javascript:;" data-type="change_prefs" data-value="'+dashSummaryProf+'" >Settings</a></div><h3>'+box+'</h3></div><span class="ebyColor">'+packInfo+'</span><p class="ebyPlan">'+plan+'</p></div>';
              	editButtons = '<div class="edit-buttons"></div>';
            }
          	
        } else {
        	subscriptionHtml += '<div class="ebyBoxDetails"><div class="ebyDashSubHeader"><span class="membershipStatusCopy inactive">Inactive</span><h3>'+box+'</h3></div><span class="ebyColor">'+packInfo+'</span><p class="ebyPlan">'+plan+'</p></div>';
        }
      }
      //subscriptionHtml += customProductHTML;
      subscriptionHtml += s;
      subscriptionHtml += editButtons;
      //subscriptionHtml += '<div class="special-buttons">'+ skpBtn + '</div>';
      //subscriptionHtml += '<div class="ebyBoxPricing">'+boxPricing+'</div>';
      
      //toDo: validate if this is 3n+1

      // out of date
      if (!!nextChargeDetail && !!isBlackoutActive && subscriptionDetail.status == 'ACTIVE') {
        subscriptionHtml += '<div class="renew-msg"></div><a class="subscription-renew-btn btn" data-id="'+subscriptionDetail.id+'">Renew Now</a><p class="membership_details_blurb">* Any and all changes to your box must be made 10 days before your Next Box Date. <span>Any changes made during the 10 days before your next box date will not be reflected in your immediate shipment.</span></p>';  
      } else {
        subscriptionHtml += '<div class="renew-msg"></div><a class="subscription-renew-btn btn" data-id="'+subscriptionDetail.id+'">Renew Now</a><p class="membership_details_blurb">* Any and all changes to your box must be made 10 days before your Next Box Date. <span>Any changes made during the 10 days before your next box date will not be reflected in your immediate shipment.</span></p>';
      }
      
      subscriptionHtml += '</div>';
      subscriptionHtml += '<div class="ebySubscriptionImage">';
      var subImage = !!subscriptionProduct.images[0] ? subscriptionProduct.images[0].src : "";
      //subscriptionHtml += '<img src="'+ subImage +'">';
      subscriptionHtml += '<img src="https://cdn.shopify.com/s/files/1/0313/4062/5964/files/480_-_PROD_-_subscription_-_default.jpg">';
      subscriptionHtml += '</div>';

      $subscriptionBox.html(subscriptionHtml);
      //console.log($.cookie("subscription_status"));
      
      if($.cookie("subscription_status") == "true"){
        $(".subscriptionUpdate").html('<p>Your Membership Has Updated.</p>');
        setTimeout(function(){
          $(".subscriptionUpdate").hide();
          $.cookie("subscription_status", null);
        }, 10000);
      }
      
      var cDate = new Date();
      var d = cDate.getMonth()+'-'+cDate.getDate()+'-'+cDate.getFullYear()
      var $date = $(document).find('input[name="date"]');
      $date.datetimepicker({
        format: 'YYYY-MM-DD'
      });
      //$(document).find('input[name="date"]').datepicker();
    }
  };
  
  function generatForms(customer){
    var $payment = $('#paymentPopup');
  };
  
  function getCustomer(){
    console.log('::Get customer init::');
    
    $.ajax({
      type: "POST",
      crossDomain:true,
      url: window.APIDomain+window.otherAPI+"get_customer.php",
      data: {data: {'customer': window.customer_id } },
      dataType: 'json',
      beforeSend: function() {
        $('body').addClass('velaCartAdding');
      },
      success: function(data){
        console.log('::Get customer successful::', data.subscription);
        
        setDetails(data);
        generatForms(data);

        currentCustomerData = data;
        
        if (!!data.address) {
        	generateBillingDetails(data.customer, data.address.id);
        	generateShippingDetails(data.address);
        } else {
        	generateBillingDetails(data.customer, null);
            var customerAddressData = {
              address1: data.customer.billing_address1,
              address2: data.customer.billing_address2,
              city: data.customer.billing_city,
              zip: data.customer.billing_zip,
              province: data.customer.billing_province,
              country: data.customer.billing_country,
              phone: data.customer.billing_phone
            }
          
          	generateShippingDetails(customerAddressData);
        }
        
        generateAccountDetails(data.customer);
        
        window.subCustomerId = data.customer.id;
        
        $.ajax({
          type: "POST",
          crossDomain : true,
          url: window.APIDomain+window.otherAPI+"subscription.php",
          data: { data: {
            type:'getLogsByCustomer',
            custId: data.customer.id
          }},
          dataType: 'json',
          success: function(logData){
            console.log(':: logs received successfully ::', logData);
            
            var logs = logData['metafields'];
            
            if (logs.length > 0) {
              console.log('::temp:: hide the skip button for example');
              // toDo: update totalSubscriptionSkips, currentSkipLog, and currentSkipLogId
              if (logs[0].key === "subscription_skip_data") {
              	currentSkipLogId = logs[0].id;
      			currentSkipLog   = logs[0].value;
                
                var logData = logs[0].value.split(',');
                /*0: "timestamp:2021-07-02"1: "skipped_to:2022-10-10"2: "skips:1"*/
                var currently = new Date();
                var loggedSkipToDate = logData[1].replace('skipped_to:', '');
                var loggedSkipAttempts = logData[1].replace('skips:', '');
                
                totalSubscriptionSkips = +loggedSkipAttempts;
                window.hasSkipped = true;
                
                if (currently < new Date(loggedSkipToDate)) {
                	// hide the skip button
                	disableSkip = true;
                  	jQuery('#skip-popup-btn').prop('disabled', true);
                }
                
              } else {
              	// remove skip button by default possibly
                
              }
            } else {
              console.log(':: Not current logs ::');
            }

			$('body').removeClass('velaCartAdding');

          },
          error: function(xhr, text) {

            console.log(':: logs pull failure ::', {
              text: text,
              xhr: xhr.statusCode()
            });
          }
        });
        
      },
      error: function(xhr, text) {
        $('body').removeClass('velaCartAdding');
        console.log('::Get customer failure::', {
          text: text,
          xhr: xhr
        });
      }
    });
    
    /*$.ajax({
      type: "POST",
      url: "https://www.qetail.com/shopify_app/sanket/stripe/get_customer.php",
      //url: "https://secureddatasystem.com/ShopifyApps/eby/stripe/get_customer_payment.php",
      data: {data: {'customer': window.customer_email }},
      dataType: 'json',
      beforeSend: function() {
        $('body').addClass('velaCartAdding');
      },
      success: function(data){
        console.log(data);
        
        var paymentDetail = '<li>'+data.brand+' •••• '+data.last4+'</li>';
        paymentDetail += '<li>'+data.name;
        paymentDetail += '<li>Expires '+ ("0" + data.exp_month).slice(-2)+'/'+ data.exp_year +'</li>';
        $payment.find('.accountContent').html('<ul class="addressInfo list-unstyled">'+paymentDetail+'</ul>');
        $payment.removeClass('hide');
        
        $('#stripe_customer_id').val(data.customer_id);
        
        $('#card_owner_name').val(data.name);
        
        //$('body').removeClass('velaCartAdding');
      },
      error: function(xhr, text) {
        $('body').removeClass('velaCartAdding');
        console.log(text);
        console.log(xhr);
      }
    });*/
  };
  
  function getCurrentBoxName (subProdName) {
    console.log(":: getCurrentBoxName init ::", subProdName);
    
    if (subProdName.indexOf("Mixed Styles") >= 0) {
    	return "mx";
    } else if (subProdName.indexOf("Full Coverage") >= 0) {
    	return "fc";
    } else if (subProdName.indexOf("All Thongs") >= 0) {
    	return "at";
    } else if (subProdName.indexOf("All Briefs") >= 0) {
    	return "ab";
    } else if (subProdName.indexOf("All Highwaisted") >= 0) {
    	return "ahw";
    } else if (subProdName.indexOf("Trial") >= 0) {
    	return "trial";
    } else {
    	return "cb";
    }
    
  };
  
  /**
  * get product data
  * @param => ex "all-thongs"
  **/
  function getSelectedBoxData (selectedBoxKey) {
  	
    // get current plan
    if (!!newlySelectedPlanData) {
    	var currPlan = newlySelectedPlanData == 6 ? "semi-annual" : "quarterly";
    } else {
    	var currPlan = currentCustomerData.subscription.order_interval_frequency == 6 ? "semi-annual" : "quarterly";
    }
    if (!!newlySelectedSizeData) {
        // get current size 
        var currSize = newlySelectedSizeData;
    } else {
        // get current size 
        var currSize = currentCustomerData.subscription.variant_title;
    }
    
    
    /**
    * eby-subscription-<btnVal>-in-<currColor>-<currPlan>
    * or
    * eby-custom-subscription-<currPlan>
    **/
    var boxHandle = "";
    
    if (selectedBoxKey === "custom-box") {
    	boxHandle = "eby-custom-subscription-" + currPlan;
    } else {
      	if (!!newlySelectedColorData) {
            // get current color
            var currColor = newlySelectedColorData;
      	} else {
            // get current color
            var currColor = currentCustomerData.subscription.product_title.indexOf("Neutrals") >= 0 ? "neutrals" : "mixed";
      	}
      	
    	boxHandle = "eby-subscription-" + selectedBoxKey + "-in-" + currColor + "-" + currPlan;
    }
    
    console.log(":: getSelectedBoxData init ::", {
      boxHandle: boxHandle
    });
    
    
    return window.ebOpts.reduce(function (acc, prod) {
      console.log(":: desiredBoxData loopfeed :: ", prod);
      
      if (prod.handle === acc.handle) {
      	acc.newBox = prod;
        acc.newHandle = prod.handle;
      }
      
      return acc;
    }, {handle: boxHandle});
    
    // return product data obj
  };
  
  /*$('.recharge_forms').submit(function(e){
    e.preventDefault;
    console.log($(this).serialize());
    
    $.ajax({
      type: "POST",
      crossDomain : true,
      url: "https://secureddatasystem.com/ShopifyApps/eby/update_customer.php",
      data: $(this).serialize(),
      dataType: 'json',
      success: function(data){
        console.log(data);
      },
      error: function(xhr, text) {
        console.log(text);
        console.log(xhr);
      }
    });
  });*/
  
  /* eby - accordion func */
  /*
  $(document).ready(function(){

    Smooch.on('widget:closed', function() {
      $('#gorgias-web-messenger-container').fadeOut();
    });

  });
  */
  
  
  
  /* click listeners */
  
  
  // to change current box
  jQuery('body').on('click', '.changeMyBoxPopupBtn', function (ev) {
    console.log('::set the default membership info::');
    
    console.log(":: log current and needed boxOpts ::", {
      data: currentCustomerData,
      opts: window.ebOpts
    });
    
    var currentMembership = currentCustomerData.subscription.product_title;
    
    // whats the current box? make that active and disabled
    if (currentMembership.indexOf('Custom') >= 0) {
        if (!jQuery('.styleGroupChoice .dash-boxChoiceOption.custom').hasClass('selected')) {
          //jQuery('.dash-boxChoiceOption.curate').removeClass('selected');
          
          jQuery('.styleGroupChoice .dash-boxChoiceOption.custom').toggleClass('selected');
          jQuery('.styleGroupChoice .dash-boxChoiceOption.custom button').attr('disabled', true);
          jQuery('.styleGroupChoice .dash-boxChoiceOption.custom button').text('Selected');
        }
      	if (jQuery('.dash-boxChoiceOption.curate').hasClass('selected')) {
          //jQuery('.dash-boxChoiceOption.curate').removeClass('selected');
          
          jQuery('.dash-boxChoiceOption.curate.selected button').attr('disabled', false);
          jQuery('.dash-boxChoiceOption.curate.selected button').text('Select');
          jQuery('.dash-boxChoiceOption.curate.selected').toggleClass('selected');
        }
    } else {
      	if (!jQuery('.styleGroupChoice .dash-boxChoiceOption.curate').hasClass('selected')) {
          jQuery('.styleGroupChoice .dash-boxChoiceOption.curate').toggleClass('selected');
          jQuery('.styleGroupChoice .dash-boxChoiceOption.custom').removeClass('selected');
          
          jQuery('.styleGroupChoice .dash-boxChoiceOption.custom button').attr('disabled', false);
          jQuery('.styleGroupChoice .dash-boxChoiceOption.custom button').text('Select');
        }
    	// its a surprise box
        var currentSurpriseBoxSelected = getCurrentBoxName(currentMembership);
      	
      	jQuery('.dash-boxChoiceOption.curate.' + currentSurpriseBoxSelected).toggleClass('selected');
      	jQuery('.dash-boxChoiceOption.curate.' + currentSurpriseBoxSelected + " button").attr('disabled', true);
      	jQuery('.dash-boxChoiceOption.curate.' + currentSurpriseBoxSelected + " button").text('Selected');
    }

    // check defaults
    if (jQuery('#changeMyBoxPopup-choice').attr("value") !== "") {
        jQuery('#changeMyBoxPopup-choice').attr("value", "");
        jQuery('#changeMyBoxPopup .submitSelect').attr("disabled", true);
      
        newlySelectedBoxData = null;
        newlySelectedSizeData = null;
        newlySelectedPlanData = null;
        newlySelectedColorData = null;
    }
    
  });
  
  // disabled certain preferences
  var checkPrefsEnabled = function (boxData) {
    console.log(":: checkPrefsEnabled init ::", boxData);
    var sizesNotSold = ['xs', '1x', '2x', '3x', '4x'];
    
    if (boxData.box.toLowerCase().indexOf('custom') >= 0) {
    	return;
    }
    
    if (boxData.init === 'default') {
      	if (!!jQuery('input[data-val="neutrals"]').prop('disabled')) {
      		jQuery('input[data-val="neutrals"]').prop('disabled', false);
          	jQuery('input[data-val="neutrals"]').closest('label').removeClass('disabled');
        }
      	if (!!jQuery('input[name="boxPref-sizes"]').prop('disabled')) {
          	// enable all sizes
        	sizesNotSold.map(function (sizeOpt, index) {
                jQuery('input[data-val="'+sizeOpt+'"]').prop('disabled', false);
                jQuery('input[data-val="'+sizeOpt+'"]').closest('label').removeClass('disabled');
            });
        }
      	if (!!jQuery('input[data-val="semi-annual"]').prop('disabled')) {
        	jQuery('input[data-val="semi-annual"]').prop('disabled', false);
          	jQuery('input[data-val="semi-annual"]').closest('label').removeClass('disabled');
        }
    }
    
    
    // if size is not sold
    if (sizesNotSold.indexOf(boxData.size) >= 0) {
    	
      // find the input with this "data-val" and disable it
      // find the label with this "for" value and add class to disable it
      
      // turn off neutrals
      jQuery('input[data-val="neutrals"]').prop('disabled', true).prop('checked', false);
      jQuery('input[data-val="neutrals"]').closest('label').addClass('disabled');
      // turn off semi-annual
      jQuery('input[data-val="semi-annual"]').prop('disabled', true).prop('checked', false);
      jQuery('input[data-val="semi-annual"]').closest('label').addClass('disabled');
      
    } else {
      	if (!!boxData.size && boxData.init === 'update') {
            jQuery('input[data-val="neutrals"]').prop('disabled', false);
            jQuery('input[data-val="neutrals"]').closest('label').removeClass('disabled');
            //
            jQuery('input[data-val="semi-annual"]').prop('disabled', false);
            jQuery('input[data-val="semi-annual"]').closest('label').removeClass('disabled');
      	}
    }
    
    // if color is neutrals
    if (boxData.color === "only neutrals" || boxData.color === "neutrals") {
    	// turn off semi-annual
        jQuery('input[data-val="semi-annual"]').prop('disabled', true).prop('checked', false);
        jQuery('input[data-val="semi-annual"]').closest('label').addClass('disabled');
      	// turn off 1x-4x and xs
        sizesNotSold.map(function (sizeOpt, index) {
          jQuery('input[data-val="'+sizeOpt+'"]').prop('disabled', true).prop('checked', false);
          jQuery('input[data-val="'+sizeOpt+'"]').closest('label').addClass('disabled');
        });
    } else {
      	if (!!boxData.color && boxData.init === 'update') {
            // turn on semi-annual
            jQuery('input[data-val="semi-annual"]').prop('disabled', false);
            jQuery('input[data-val="semi-annual"]').closest('label').removeClass('disabled');
            // turn on 1x-4x and xs
            sizesNotSold.map(function (sizeOpt, index) {
              jQuery('input[data-val="'+sizeOpt+'"]').prop('disabled', false);
              jQuery('input[data-val="'+sizeOpt+'"]').closest('label').removeClass('disabled');
            });
      	}
    }
    
    if (boxData.plan === "semi-annual" || boxData.plan === 6) {
    
      	// turn off neutral
        jQuery('input[data-val="neutrals"]').prop('disabled', true);
        jQuery('input[data-val="neutrals"]').closest('label').addClass('disabled');
      	// turn off 1x-4x and xs
      	sizesNotSold.map(function (sizeOpt, index) {
            jQuery('input[data-val="'+sizeOpt+'"]').prop('disabled', true).prop('checked', false);
            jQuery('input[data-val="'+sizeOpt+'"]').closest('label').addClass('disabled');
      	});
    } else {
      	if (!!boxData.plan && boxData.init === 'update') {
            // turn on neutral
            jQuery('input[data-val="neutrals"]').prop('disabled', false);
            jQuery('input[data-val="neutrals"]').closest('label').removeClass('disabled');
            // turn on 1x-4x and xs
            sizesNotSold.map(function (sizeOpt, index) {
              jQuery('input[data-val="'+sizeOpt+'"]').prop('disabled', false);
              jQuery('input[data-val="'+sizeOpt+'"]').closest('label').removeClass('disabled');
            });
      	}
    }
    
    if (boxData.color === "only neutrals" || boxData.color === "neutrals") {
    	// no semi
        jQuery('input[data-val="semi-annual"]').prop('disabled', true).prop('checked', false);
        jQuery('input[data-val="semi-annual"]').closest('label').addClass('disabled');
      	// turn off 1x-4x and xs
        sizesNotSold.map(function (sizeOpt, index) {
          jQuery('input[data-val="'+sizeOpt+'"]').prop('disabled', true).prop('checked', false);
          jQuery('input[data-val="'+sizeOpt+'"]').closest('label').addClass('disabled');
        });
    } else if (boxData.plan === "semi-annual" || boxData.plan === 6) {
    	// neutrals
        jQuery('input[data-val="neutrals"]').prop('disabled', true);
        jQuery('input[data-val="neutrals"]').closest('label').addClass('disabled');
      	// turn off 1x-4x and xs
      	sizesNotSold.map(function (sizeOpt, index) {
            jQuery('input[data-val="'+sizeOpt+'"]').prop('disabled', true).prop('checked', false);
            jQuery('input[data-val="'+sizeOpt+'"]').closest('label').addClass('disabled');
      	});
    } else if (sizesNotSold.indexOf(boxData.size) >= 0) {
        // turn off neutrals
        jQuery('input[data-val="neutrals"]').prop('disabled', true).prop('checked', false);
        jQuery('input[data-val="neutrals"]').closest('label').addClass('disabled');
        // turn off semi-annual
        jQuery('input[data-val="semi-annual"]').prop('disabled', true).prop('checked', false);
        jQuery('input[data-val="semi-annual"]').closest('label').addClass('disabled');
    }
    
    if (boxData.box.toLowerCase().indexOf('thongs') >= 0) {
    	if ((boxData.color === "mixed" || boxData.color === "mixed styles" || currentCustomerData.subscription.product_title.indexOf('Neutrals') <= 0) && (boxData.plan === "quarterly" || boxData.plan === 3 || currentCustomerData.subscription.order_interval_frequency === "3")) {
            // no size avail	`
            jQuery('input[data-val="3x"]').prop('disabled', true).prop('checked', false);
            jQuery('input[data-val="3x"]').closest('label').addClass('disabled');
          	jQuery('input[data-val="4x"]').prop('disabled', true).prop('checked', false);
            jQuery('input[data-val="4x"]').closest('label').addClass('disabled');
            
        }
    }
    
    
  };
  
  jQuery('body').on('click', '.changeMyPreferencesPopupBtn', function (ev) {
    console.log('::set the default pref info::');
    
    console.log(":: log current and needed boxOpts ::", {
      data: currentCustomerData,
      opts: window.ebOpts
    });
    
    var currentMembership = currentCustomerData.subscription.product_title;
    
    // variant_title 
    var currSizePref = currentCustomerData.subscription.variant_title;
    
    // order_interval_frequency 
    var currPlanPrefCycle = currentCustomerData.subscription.order_interval_frequency;
    var currPlanPref = "";
    if (currPlanPrefCycle === "3") {
    	currPlanPref = "quarterly";
    } else if (currPlanPrefCycle === "6") {
    	currPlanPref = "semi-annual";
    } else {
      	currPlanPref = "trial";
    }
    
    var membershipDataAtm = ev.target.getAttribute('data-value');
    
    // if im semi annual, shut off neutrals and xs and 1x,2x,3x,4x

    // if im neutrals, shut off xs and 1x,2x,3x,4x
    var membershipColorAtm = membershipDataAtm.split(',')[2].replace('color=', "").toLowerCase();
    
    // if im xs or 1x,2x,3x,4x, shut off neutrals and semi-annual
    var membershipSizeAtm = membershipDataAtm.split(',')[1].replace('size=', "").toLowerCase();
    
    
    // whats the current box? hide color if so
    if (currentMembership.indexOf('Custom') >= 0) {
      if (!jQuery('.dash-prefChoiceOptions.colorGroup').hasClass('hide')){
      	jQuery('.dash-prefChoiceOptions.colorGroup').toggleClass('hide');
      }
      
      // set selected preferences
      jQuery("#changeMyPrefsPopup .dash-prefChoiceOptions input[data-sizeOpt='"+ currSizePref +"']").prop("checked", true);
      jQuery("#changeMyPrefsPopup .dash-prefChoiceOptions input[data-planOpt='"+ currPlanPref +"']").prop("checked", true);
      
    } else {
      // its s&d, set all 3 prefs
      var currColor = currentCustomerData.subscription.product_title.indexOf("Neutrals") >= 0 ? "neutrals" : "mixed";
      
      checkPrefsEnabled({
        size: currSizePref,
        plan: currPlanPref,
        color: currColor,
        box: currentCustomerData.subscription.product_title,
        init: 'default'
      });
      
      // set selected preferences
      jQuery("#changeMyPrefsPopup .dash-prefChoiceOptions input[data-sizeOpt='"+ currSizePref +"']").prop("checked", true);
      jQuery("#changeMyPrefsPopup .dash-prefChoiceOptions input[data-planOpt='"+ currPlanPref +"']").prop("checked", true);
      jQuery("#changeMyPrefsPopup .dash-prefChoiceOptions input[data-colorOpt='"+ currColor +"']").prop("checked", true);
    }
    
    // set main input to save new preference
    let latestStylePref = currentCustomerData.subscription.properties.filter((item, index)=> {return item.name === "style_preferences"})[0];
    if (!!latestStylePref) {
      jQuery('.dash-prefChoiceOptions.styleGroup input[data-val="'+ latestStylePref.value +'"]').prop('checked', true);
    }
    // if preferences are saved
    // customer has all data
    // 
    
    

    // check defaults
    if (jQuery('#changeMyPrefsPopup-choice').attr("value") !== "") {
        jQuery('#changeMyPrefsPopup-choice').attr("value", "");
        jQuery('#changeMyPrefsPopup .ebyDashPopupSaveBtn.submitSelect').attr("disabled", true);

      	newlySelectedBoxData = null;
        newlySelectedSizeData = null;
        newlySelectedPlanData = null;
        newlySelectedColorData = null;
    }
    
  });
  
  
  $('body').on('click', '.dash-prefChoiceOptions input', function (ev) {
        console.log('::dash-prefChoiceOptions label init::',{
            input: ev.target
        });
        //ev.preventDefault();

    	// update global value for size if thats updated
        // update global value for color if thats updated
    	// update global value for plan if thats updated
  
    	var prefInput = ev.target;
   		var prefData = "";
    	var prefKey = "";
    
    	switch(prefInput.name){
          case "boxPref-plans":
            	prefData = prefInput.getAttribute('data-val');
            	if (prefData === "quarterly") {
            		newlySelectedPlanData = 3;
                } else if (prefData === "semi-annual") {
                	newlySelectedPlanData = 6;
                } else {
                	newlySelectedPlanData = 1;
                }
            	prefKey = "planGroup-" + prefData;
            break;
          case "boxPref-sizes":
            	prefData = prefInput.getAttribute('data-val');
            	newlySelectedSizeData = prefData;
            	prefKey = "sizeGroup-" + prefData;
            break;
          case "boxPref-colors":
            	prefData = prefInput.getAttribute('data-val');
            	newlySelectedColorData = prefData;
            	prefKey = "colorGroup-" + prefData;
            break;
    	}
  
    	// enable save btn
    	// update the value of the hidden input with info to submit to api

        jQuery('#changeMyPrefsPopup .submitSelect').attr("disabled", false);
    
    	var currentBoxKey = getCurrentBoxName(currentCustomerData.subscription.product_title);
    	var boxSelectionKey = "";
    	switch(currentBoxKey) {
          case "cb":
            boxSelectionKey = "custom-box";
            break;
          case "fc":
            boxSelectionKey = "full-coverage";
            break;
          case "at":
            boxSelectionKey = "all-thongs";
            break;
          case "ab":
            boxSelectionKey = "all-briefs";
            break;
          case "ahw":
            boxSelectionKey = "all-highwaisted";
            break;
          case "mx":
            boxSelectionKey = "mixed-styles";
            break;
          case "trial":
            boxSelectionKey = "trial-box";
            break;
    	}

        if (jQuery('#changeMyPrefsPopup-choice').attr("value") === "") {
          jQuery('#changeMyPrefsPopup-choice').attr("value", boxSelectionKey); 
        }
    
        var newlySelectedBox = getSelectedBoxData(boxSelectionKey);
        // get new box key by first getting the core product
        newlySelectedBoxData = newlySelectedBox.newBox;
        
    	checkPrefsEnabled({
          size: newlySelectedSizeData,
          plan: newlySelectedPlanData,
          color: newlySelectedColorData,
          box: boxSelectionKey,
          init: 'update'
        });
  });


  $('body').on('click', '.ebyFancyBtn', function (ev) {
        console.log('::ebyfancyBtn init::');
        ev.preventDefault();

        // show popup
        var popupId = !!ev.target.getAttribute('src') ? ev.target.getAttribute('src') : ev.target.getAttribute('data-src');
        $.fancybox.open(jQuery(popupId));

        // what data is needed?


        // if its select-styleGroup, then show s&d options
        var btnType = ev.target.getAttribute('data-type');
        var btnVal = ev.target.getAttribute('data-value');
    	console.log('::button data::', {btnVal:btnVal,btnType:btnType });
    
    
//     	var subData = btnVal.split(",");
//     	var currStyleGroup = subData[0].replace("style=", "");
    
  });
  
  $('body').on('click', '.ebyDashSelectBtn', function (ev) {
        console.log('::ebyDashSelectBtn init::');
        ev.preventDefault();

        // what data is needed?

        // if its select-styleGroup, then show s&d options
        var btnType = ev.target.getAttribute('data-type');
        var btnVal = ev.target.getAttribute('data-val');
    	var currBox = getCurrentBoxName(currentCustomerData.subscription.product_title);
    	console.log('::button data::', {btnVal:btnVal,btnType:btnType });
    
    	//var subData = btnVal.split(",");
    	//var currStyleGroup = subData[0].replace("style=", "");
    	if (btnType === "select-styleGroup") {
    		jQuery('.styleGroupChoice').toggleClass('hide');
          	jQuery('.chooseStyleGroupWrapper').toggleClass('hide');
        }
    
    	if (btnType === "update-styleGroup") {
          
          	// update the save buttons

          	var boxSelectionKey = btnVal;
          	
          	// if the value is x, get that box from opts avail
          	if (boxSelectionKey === "custom-box") {
              	jQuery('.dash-boxChoiceOption.curate.selected button').attr('disabled', false);
                jQuery('.dash-boxChoiceOption.curate.selected button').text('Select');
          		jQuery('.dash-boxChoiceOption.curate').removeClass('selected');
              	jQuery('.dash-boxChoiceOption.custom').toggleClass('selected');
              	
                jQuery('.dash-boxChoiceOption.curate.' + currBox + " button").attr('disabled', false);
                jQuery('.dash-boxChoiceOption.curate.' + currBox + " button").text('Select');
              
              	// add seletion classes
              	jQuery('.dash-boxChoiceOption.custom button').attr('disabled', true);
              	jQuery('.dash-boxChoiceOption.custom button').text('Selected');
              
              	
              	var newlySelectedBox = getSelectedBoxData(boxSelectionKey);
              	// get new box key by first getting the core product
              	newlySelectedBoxData = newlySelectedBox.newBox;
              
            } else {
              	// s&d
              	if (jQuery('.dash-boxChoiceOption.custom').hasClass('selected')) {
                    jQuery('.dash-boxChoiceOption.custom').removeClass('selected');
                    jQuery('.dash-boxChoiceOption.custom button').attr('disabled', false);
                    jQuery('.dash-boxChoiceOption.custom button').text('Select');
                } else {
                  	
                    jQuery('.chooseStyleGroupWrapper .dash-boxChoiceOption.curate.selected button').attr('disabled', false);
                    jQuery('.chooseStyleGroupWrapper .dash-boxChoiceOption.curate.selected button').text('Select');
                  	jQuery('.chooseStyleGroupWrapper .dash-boxChoiceOption.curate.selected').removeClass('selected');
                }
            	
              	var newlySelectedBox = getSelectedBoxData(boxSelectionKey);
              	// get new box key by first getting the core product
              	
              	newlySelectedBoxData = newlySelectedBox.newBox;
              
              	// add seletion classes
              	jQuery('.dash-boxChoiceOption.curate.' + getCurrentBoxName(newlySelectedBox.newBox.title) + '').addClass('selected');
              	jQuery('.dash-boxChoiceOption.curate.' + getCurrentBoxName(newlySelectedBox.newBox.title) + ' button').attr('disabled', true);
              	jQuery('.dash-boxChoiceOption.curate.' + getCurrentBoxName(newlySelectedBox.newBox.title) + ' button').text('Selected');
              
            }
          
          	// update the value of the hidden input with info to submit to api
          	jQuery('#changeMyBoxPopup-choice').attr("value", newlySelectedBox.newHandle);
          	jQuery('#changeMyBoxPopup .submitSelect').attr("disabled", false);
          
          	console.log('::  ::', {
              box : btnVal,
              newBox : newlySelectedBox
          	});
          
//             jQuery('.dash-boxChoiceOption.curate').toggleClass('selected');
//             jQuery('.dash-boxChoiceOption.curate.' + currentSurpriseBoxSelected + " button").attr('disabled', true);
//             jQuery('.dash-boxChoiceOption.curate.' + currentSurpriseBoxSelected + " button").text('Selected');
    		
    	}
  });
  
  $('body').on('click', '.ebyDashPopupBackBtn', function (ev) {
      console.log('::ebyDashPopupBackBtn init::');
      ev.preventDefault();

      // reset the box swap
      jQuery('.styleGroupChoice').toggleClass('hide');
      jQuery('.chooseStyleGroupWrapper').toggleClass('hide');
  });
  

  $('body').on('click', '.ebyDashPopupSaveBtn', function (ev) {
      console.log('::ebyDashPopupSaveBtn init::');
      ev.preventDefault();
    
      var currBtnType = ev.target.getAttribute('data-val');

      // get current subscription data
      var currSubId = currentCustomerData.subscription.id;
	  var currRenewal = currentCustomerData.subscription.next_charge_scheduled_at;
      var currPlan = !!newlySelectedPlanData ? newlySelectedPlanData : currentCustomerData.subscription.order_interval_frequency;

      var anyNewPreferences = null;
      if (!!document.querySelector('input[name="boxPref-styles"]:checked')) {
        anyNewPreferences = document.querySelector('input[name="boxPref-styles"]:checked').value;
      }
    
      if (currPlan !== currentCustomerData.subscription.order_interval_frequency) {
    	  // this is a plan change
          if (currPlan === 6) {
        	var currPrice = 65;
          } else if (currPlan === 3) {
          	var currPrice = 39;
          } else {
          	var currPrice = 39;
          }
          // alert customer that price change is happening
      } else {
      	  var currPrice = currentCustomerData.subscription.price;
      }
    
      // get new subscription data
      var currSize = !!newlySelectedSizeData ? newlySelectedSizeData : currentCustomerData.subscription.variant_title;
    
      if (!!newlySelectedBoxData) {
        var newBoxToSave =  newlySelectedBoxData.variants.reduce(function (acc, sizeVarPrd) {
          if (sizeVarPrd.title == acc.sizeDesired) {
          	acc.prd = sizeVarPrd;
          }
          return acc;
        }, {sizeDesired: currSize});
      } else {
      	var newBoxToSave = null;
      }

      var membershipUpdate = {
        "type": "membershipUpdate",
        "id" : currSubId,
        "new_product_title" : newlySelectedBoxData.title,
        "new_variant_title" : newBoxToSave.prd.title,
        "new_sku" : newBoxToSave.prd.sku,
        "new_variant_id" : newBoxToSave.prd.id,
        "next_charge_scheduled_at": currRenewal,
        "frequency" : currPlan,
        "price": currPrice,
        "new_preferences": anyNewPreferences
      };

    
      console.log('::ebyDashPopupSaveBtn fire::', membershipUpdate);
      $.fancybox.close();
      // ajax call to API 
      $('body').addClass('velaCartAdding');
    
      $.ajax({
        type: "POST",
        url: window.APIDomain+window.otherAPI+"subscription-two.php",
        data: {data: membershipUpdate},
        dataType: 'json',
        success: function(data){
          
          console.log('::ebyDashPopupSaveBtn success::', JSON.parse(data));
          
          if (currBtnType === "updatePrefs") {
              gtag('event', 'subId-' + currSubId + '::custId-' + window.customer_email, {
                'event_category': 'ebyDashEvent-updated_membership',
                'event_label': 'newlyUpdatedBox-' + newBoxToSave.prd.sku + '::membershipPrice-' + currPrice,
                'event_value': 'updatedAs-' + window.currentMembership.replace(/ /g, '-').replace(/[()]/g, '').toLowerCase()
              });
          } else {
              gtag('event', 'subId-' + currSubId + '::custId-' + window.customer_email, {
                'event_category': 'ebyDashEvent-switched_membership',
                'event_label': 'newlySwitchedToBox-' + newBoxToSave.prd.sku + '::membershipPrice-' + currPrice,
                'event_value': 'switchedAs-' + window.currentMembership.replace(/ /g, '-').replace(/[()]/g, '').toLowerCase()
              });
          }
          
          
          // fire success message
          M.toast({html: 'Membership Updated!', classes: 'ebyDashboardRespToast success'});
          
          setTimeout(function() {
            window.location.reload();
          }, 400);
        },
        error: function(xhr, text) {
          
          console.log('::ebyDashPopupSaveBtn failure::', {
            xhr:xhr, text:text
          });
          
          $.fancybox.close();
          
          $('body').removeClass('velaCartAdding');
          
          // fire success message
          M.toast({html: 'There was an issue! Please refresh the pageand try again', classes: 'ebyDashboardRespToast error'});
          
//           setTimeout(function() {
//           	window.location.reload();
//           }, 400);
        }
      });

    
      
    
    
  });
  
  
  /* end edit listeners */
  
  
  $(document).on('click', '.ebyaccordionHeader', function(){
    console.log(':: dashboard header toggle ::');
    if (!!$('.ebyaccordionContent').hasClass('active')) {
      $('.ebyaccordionContent').removeClass('active').fadeOut();
      $('.ebyaccordionHeader').removeClass('active');
    } else {
      $('.ebyaccordionContent').addClass('active').fadeIn();
      $('.ebyaccordionHeader').addClass('active');
    }
  });
  
  $('body').on('click', '.gorgias-web-messenger-container-button', function (ev) {
    $('#gorgias-web-messenger-container').fadeIn();
    Smooch.open();
  });

  // change date functionality
  $(document).on('click', '.ebyChangeDatebtn', function(){
    $(this).next('.date-field').toggleClass('hide');
    $(this).text($(this).text() == 'Cancel' ? 'Change Date' : 'Cancel');
  });
  
  // skip functionality
  $(document).on("click", ".ebySkipBtn", function(){

    console.log('::skip next box::');
    
    var type = $(this).data('type');
    var subscription_id = $(this).data('subid');
    var subNewRenewalDate = $(this).data('new_date');
    var chargeId = $(this).data('chargeid');
    var skipsSoFar = 0,
        prevSkipLog = null,
        prevSkipLogId = null;
    
    $("#skip-popup").addClass("hide");

    $('body').addClass('velaCartAdding');
    //var subscription_id = $(this).data('subscription');
    
    // get current date
    var currently = new Date();
    var timeOffset = currently.getTimezoneOffset();
    currently = new Date(currently.getTime() - (timeOffset*60*1000));
    var currentFormattedDate = currently.toISOString().split('T')[0];
    
    // get metafield on customer for skipsSoFar int
    // determine if this is the first of its kind log or an update
    if (!!window.hasSkipped) {
    	// its an update
      	skipsSoFar = totalSubscriptionSkips;
      	prevSkipLog = currentSkipLog;
      	prevSkipLogId = currentSkipLogId;
    }

    // skip subscription
    $.ajax({
      type: "POST",
      crossDomain : true,
      url: window.APIDomain+window.otherAPI+"subscription.php",
      data: { data: {
        type:'skip',
        chargeId: chargeId,
        nextRunDate: subNewRenewalDate,
        custId: window.subCustomerId,
        currDate : currentFormattedDate,
        skipAttempts : skipsSoFar + 1,
        prevLog: prevSkipLog,
        prevLogId: prevSkipLogId
      }},
      dataType: 'json',
      success: function(data){
        console.log(':: skipped success ::', data);
		/*
        ga('send', 'event', {
            'eventCategory': 'ebyDashEvent-skipped_membership',
          	'eventLabel': 'newlyJoinedCohort-' + subNewRenewalDate + '::membershipPrice-' + window.currentBoxPrice,
          	'eventAction':  'subId-' + subscription_id + '::custId-' + window.customer_email,
            'eventValue': 'reactivatedAs-' + window.currentMembership.replace(/ /g, '-').replace(/[()]/g, '').toLowerCase()
       	});
        */
        
        gtag('event', 'subId-' + subscription_id + '::custId-' + window.customer_email, {
          'event_category': 'ebyDashEvent-skipped_membership',
          'event_label': 'newlyJoinedCohort-' + subNewRenewalDate + '::membershipPrice-' + window.currentBoxPrice,
          'event_value': 'reactivatedAs-' + window.currentMembership.replace(/ /g, '-').replace(/[()]/g, '').toLowerCase()
        });
        
        window.location.reload();
      },
      error: function(xhr, text) {
        $(document).find('.renew-msg').html('<p>There was an issue reactivating your membership. Please reach out to our Customer Service team.</p>');
        $('body').removeClass('velaCartAdding');
        console.log(':: reactivation failure ::', {
          text: text,
          xhr: xhr
        });
      }
    });
    
    
  });

  $(document).on('click', '#skip-popup-btn', function () {
    $("#skip-popup").removeClass("hide");
  });

  $(document).on('click', '#skip-close-popup-btn', function () {
    $("#skip-popup").addClass("hide");
  });
  
  $(document).on('click', '#reactivate-popup-btn', function () {
    $("#reactivate-popup").removeClass("hide");
  });

  $(document).on('click', '#close-popup-btn', function () {
    $("#reactivate-popup").addClass("hide");
  });

  $(document).on('click', '.ebyReactivateBtn', function(ev){
    
    console.log('::reactivate account::');
    
    $("#reactivate-popup").addClass("hide");

    $('body').addClass('velaCartAdding');
    var id = $(this).data('id');
    var type = $(this).data('type');
    //var subscription_id = $(this).data('subscription');
    
    // is my card valid 
    console.log(window.currentMembership);

    var nextRunDate = "";
    var billDateGeneral = "";
    var currently = new Date();
    if (currently.getMonth() == 11) {
      // next month is jan
      if (currently.getDate() >= 1 && currently.getDate() < 7) {
      	nextRunDate = new Date(currently.getFullYear(), 0, 15);
        billDateGeneral = "this month";
        
      } else if (currently.getDate() > 7 && currently.getDate() < 20) {
      	nextRunDate = new Date(currently.getFullYear(), 0, 23);
        billDateGeneral = "this month";
        
      } else if (currently.getDate() > 20) {
      	nextRunDate = new Date(currently.getFullYear() + 1, 0, 10);
        billDateGeneral = nextRunDate.toLocaleString('default', { month: 'long' });
      }
      
    } else {
      // otherwise
      if (currently.getDate() >= 1 && currently.getDate() < 7) {
      	nextRunDate = new Date(currently.getFullYear(), currently.getMonth(), 15);
        billDateGeneral = "this month";
        
      } else if (currently.getDate() > 7 && currently.getDate() < 20) {
      	nextRunDate = new Date(currently.getFullYear(), currently.getMonth(), 23);
        billDateGeneral = "this month";
        
      } else if (currently.getDate() > 20) {
      	nextRunDate = new Date(currently.getFullYear(), currently.getMonth() + 1, 10);
        billDateGeneral = nextRunDate.toLocaleString('default', { month: 'long' });
      }
      
    }
    
    var timeOffset = nextRunDate.getTimezoneOffset();
    nextRunDate = new Date(nextRunDate.getTime() - (timeOffset*60*1000));
    var formattedNextDate = nextRunDate.toISOString().split('T')[0];
    

    // reactivate subscription
    $.ajax({
      type: "POST",
      crossDomain : true,
      url: window.APIDomain+window.otherAPI+"subscription.php",
      data: { data: {
        type:'reactivate', 
        id: id, 
        nextRunDate: formattedNextDate,
        billDateGeneral: billDateGeneral,
        custEmail: window.customer_email,
        currMembership : window.currentMembership,
        currBoxPrice : window.currentBoxPrice
      }},
      dataType: 'json',
      success: function(data){
        console.log(':: reactivated success ::', data);
		/*
        window.ga('send', 'event', {
            'eventCategory': 'ebyDashEvent-reactivated_membership',
          	'eventLabel': 'newlyJoinedCohort-' + formattedNextDate + '::membershipPrice-' + window.currentBoxPrice,
          	'eventAction':  'subId-' + id + '::custId-' + window.customer_email,
            'eventValue': 'reactivatedAs-' + window.currentMembership.replace(/ /g, '-').toLowerCase()
       	});
        */
        
        gtag('event', 'subId-' + id + '::custId-' + window.customer_email, {
          'event_category': 'ebyDashEvent-reactivated_membership',
          'event_label': 'newlyJoinedCohort-' + formattedNextDate + '::membershipPrice-' + window.currentBoxPrice,
          'event_value': 'reactivatedAs-' + window.currentMembership.replace(/ /g, '-').toLowerCase()
        });
        
        window.location.reload();
      },
      error: function(xhr, text) {
        $(document).find('.renew-msg').html('<p>There was an issue reactivating your membership. Please reach out to our Customer Service team.</p>');
        $('body').removeClass('velaCartAdding');
        console.log(':: reactivation failure ::', {
          text: text,
          xhr: xhr
        });
      }
    });
    
  });
  
  // process now functionality
  $(document).on("click", ".subscription-renew-btn", function(){
    $('body').addClass('velaCartAdding');
    var id = $(this).data('id');
    $.ajax({
      type: "POST",
      crossDomain : true,
      url: window.APIDomain+window.otherAPI+"subscription.php",
      data: { data: {type:'renew', id: id}},
      dataType: 'json',
      success: function(data){
        console.log(data);
        $(document).find('.renew-msg').html('<p>'+data.warning+'</p>');
        setTimeout(function(){
          $(document).find('.renew-msg').hide();
        }, 3000);
        $('body').removeClass('velaCartAdding');
      },
      error: function(xhr, text) {
        $(document).find('.renew-msg').html('<p>'+text+'</p>');
        console.log(text);
        console.log(xhr);
        $('body').removeClass('velaCartAdding');
      }
    });
  });
  
  // update date functionality
  $(document).on('submit', ".updateRechargeDate", function(e){
    var form = $(this);
    $('body').addClass('velaCartAdding');
    console.log($(form).serializeArray());
    var type = $(form).find('.type').val(), date = $(form).find('.date').val(), id = $(form).find('.id').val();
    console.log();
    $.ajax({
      type: "POST",
      crossDomain : true,
      url: window.APIDomain+window.otherAPI+"subscription.php",
      data: { data: {
        id:id,
        date:date,
        type:type
      }},
      dataType: 'json',
      success: function(data){
        //console.log(data);
        getCustomer();
        //$('body').removeClass('velaCartAdding');
      },
      error: function(xhr, text) {
        console.log(text);
        console.log(xhr);
        $('body').removeClass('velaCartAdding');
      }
    });
    return false;
  });
  
  function updateRechargeCustomer(customerID, stripeToken){
    $.ajax({
      type: "POST",
      url: window.APIDomain+window.otherAPI+"update_recharge_customer.php",
      data: {data: {
        stripeToken:stripeToken,
        customerID:customerID,
      }},
      dataType: 'json',
      beforeSend: function() {
        $('body').addClass('velaCartAdding');
        //location.reload();
      },
      success: function(data){
        console.log(data);
        $('body').removeClass('velaCartAdding');
        location.reload();
      },
      error: function(xhr, text){
        $('body').removeClass('velaCartAdding');
        console.log(text);
        console.log(xhr);
      }
    });
  }
  
  $(document).on('submit', ".recharge_forms", function(e){
    var form = $(this);
    $('body').addClass('velaCartAdding');
    console.log('sdf');
    if($(this).hasClass('paymentDetailForm')){
      var formData = $(form).serializeArray();
      //console.log(formData);

      stripe.createToken(cardElement).then(function(result) {
        // Handle result.error or result.token
        if(result.error != undefined){
          displayError.textContent = result.error.message;
        }
        if(result.token != undefined){
          //console.log(result);

          var formData = $(form).serializeArray();
          console.log(formData);
          var customerID = $(form).find('input[name="customer_id"]').val();
          displayError.textContent = '';
          $.ajax({
            type: "POST",
            url: "https://www.qetail.com/shopify_app/sanket/stripe/update_customer.php",
            data: {data: formData},
            dataType: 'json',
            beforeSend: function() {
              $('body').addClass('velaCartAdding');
              //location.reload();
            },
            success: function(data){
              console.log(data);
              if(data.error != undefined){
                $('#card-errors').text(data.error.message);
                $('#card-errors').addClass('hvr-buzz-out');
                $('body').removeClass('velaCartAdding');
              }else{
                $('#card-errors').removeClass('hvr-buzz-out');
                $('body').removeClass('velaCartAdding');
                updateRechargeCustomer(customerID, data.id);
              }
              //updateRechargeCustomer(customerID, data.id);
            },
            error: function(xhr, text){
              $('body').removeClass('velaCartAdding');
              console.log(text);
              console.log(xhr);
            }
          });
        }
      });
      /*$.ajax({
        type: "POST",
        crossDomain : true,
        url: "https://secureddatasystem.com/ShopifyApps/eby/update_customer.php",
        data: { data: $(form).serializeArray()},
        dataType: 'json',
        success: function(data){
          console.log(data);
          $.fancybox.close();
          
          $('body').removeClass('velaCartAdding');
        },
        error: function(xhr, text) {
          console.log(text);
          console.log(xhr);
          $('body').removeClass('velaCartAdding');
        }
      });*/
    }else{
      if($(form).find('.type').val() == "shipping_address"){
        $(this).validate({
          rules: {
            phone: {
              required: true,
              phoneUS: true
            }
          }
        });
      }
      if($(form).find('.type').val() == "billing_address"){
        $(this).validate({
          rules: {
            billing_phone: {
              required: true,
              phoneUS: true
            },
            email: {
              required: true,
              email: true
            }
          }
        });
      }
      
      $.ajax({
        type: "POST",
        crossDomain : true,
        url: window.APIDomain+window.otherAPI+"update_customer.php",
        data: { data: $(form).serializeArray()},
        dataType: 'json',
        success: function(data){
          console.log(data);
          
          if(data.customer != undefined){
            if(data.customer.errors != undefined){
              var err = '';
              for (var key of Object.keys(data.customer.errors)) {
                //console.log(key + " -> " + data.customer.errors[key])
                err += '<p>'+data.customer.errors[key]+'</p>';
              }
              $(form).find('.error').html(err);
            }else{
              $.fancybox.close();
              if(data.address != undefined){
                generateShippingDetails(data.address.address);
              }
              generateBillingDetails(data.customer.customer, $(form).find('#address_id').val());
              generateAccountDetails(data.customer.customer);
            }
          }
          if(data.address != undefined){
            if(data.address.errors != undefined){
              var err = '';
              for (var key of Object.keys(data.customer.errors)) {
                //console.log(key + " -> " + data.customer.errors[key])
                err += '<p>'+data.customer.errors[key]+'</p>';
              }
              $(form).find('.error').html(err);
            }else{
              $.fancybox.close();
              generateShippingDetails(data.address.address);
              if(data.customer != undefined){
                generateBillingDetails(data.customer.customer, data.address.address.id);
                generateAccountDetails(data.customer.customer);
              }
            }
          }
          
          $('body').removeClass('velaCartAdding');
        },
        error: function(xhr, text) {
          console.log(text);
          console.log(xhr);
          $('body').removeClass('velaCartAdding');
        }
      });
    }
        
    return false;
  });
};

jQuery('body').on('click', '.ept .swatch-element label', function (ev) {
  ev.preventDefault();
  ev.stopPropagation();
  console.log(":: d.selection attempt ::", ev);

  window.prdIdSelected = jQuery(ev.target).closest('.selection-wrapper').attr('id').replace('velaQuickAdd-', '');
  window.prdVarIdSelected = jQuery(ev.target).attr('for').replace('quickview-swatch-', '').split('-0')[0];

  console.log(':: postData ::');
  
  // show prompt screen with selection
  let selectionName = jQuery(ev.target).closest('.velaProBlockInner').find('img').attr('title') + " - " + ev.target.className;
  jQuery('#selectMyBralettePopup-productName').text(selectionName);
  jQuery("#addABralettePrompt").fadeIn();

  return;
  
});
jQuery('body').on('click', '.proButton .btnAddToCart', function (ev) {
  ev.preventDefault();
  ev.stopPropagation();
  console.log(":: m.selection attempt ::", ev);

  window.prdIdSelected = jQuery(ev.target).closest('form').attr('id').replace('productSelectQuickview-', '').replace('product-actions-', '');
  window.prdVarIdSelected = jQuery(ev.target).closest('form').find('.swatch-element input:checked').attr('id').replace('quickview-swatch-', '').split('-0')[0];

  console.log(':: postData ::');
  
  // show prompt screen with selection
  let selectionName = jQuery('.ept[data-pid="'+window.prdIdSelected+'"]').find('img').attr('title') + " - " + jQuery(ev.target).closest('form').find('.swatch-element input:checked').val();
  jQuery('#selectMyBralettePopup-productName').text(selectionName);
  jQuery("#addABralettePrompt").fadeIn();

  return;
  
});

jQuery('body').on('click', '.pop_wrap .swatch-element', function(e){
  var valueName = $(this).data("valueName");
  console.log(':: m.size button click ::', e.target);
  if (valueName != undefined) {
    var swatch = $(this).parent('.swatch');
    swatch.find('.swatch-text').text(valueName); 
  }
  jQuery('.swatch-element.selectedSwatch').removeClass('selectedSwatch');
  jQuery('.swatch-element.'+jQuery(this).data("value")).addClass('selectedSwatch');
  

});

jQuery('body').on('click', '.backBtn.goBackToSelectionsBtn', function (ev) {
  //ev.preventDefault();
  //ev.stopPropagation();
  console.log(":: back btn ::", ev);
  
  // show prompt screen with selection
  jQuery("#addABralettePrompt").fadeOut();

  return;
  
});

jQuery('body').on('click', '.saveBtn.saveMyBoxBtn', function (ev) {
  ev.preventDefault();

  console.log(":: save btn ::", ev);
  
  //jQuery('body').addClass('velaCartAdding');
  
  var postData = {};

  postData["shopify_customer_id"] = window.customer_id;
  postData["size"] = window.currentSubSize;
  postData["add_a_bralette"] = true;
  postData["sub_id"] = window.currentBoxVarId;
  postData["sub_p"] = window.currentBoxPrice;

  //var boxProductsCount = 5;

  postData["product_1"] = {};

  postData["product_1"]["product_id"] = window.prdIdSelected;
  postData["product_1"]["variant_id"] = window.prdVarIdSelected;

  console.log(':: postData ::', postData);
  $('body').addClass('velaCartAdding');
  jQuery.fancybox.close();
  
  // show prompt screen with selection
  
  $.ajax({
    type: "POST",
    crossDomain : true,
    url: window.APIDomain+window.otherAPI+"custom_box-upgraded.php",
    data: {data: postData },
    dataType: 'json',
    success: function(response) {
      //jQuery('body').removeClass('velaCartAdding');

      	window.location.href = "https://shop.join-eby.com/account";
	        
      	console.log('::success?::', response);
      
      	
//       if (typeof(response["success"]) === "undefined") {
//         alert("An error ocurred! Please try again.");
//       } else {
//         window.location.href = "https://shop.join-eby.com/account";

//         return;
//       }
    },                
    error: function(xhr, text) {
      jQuery('body').removeClass('velaCartAdding');
      alert("Error! Please try again.");
    }
  });   

  return;
  
});

jQuery('body').on('click', '.ebyThankYouReferralLink', function (ev) { 
  //console.log('hey, listen', ev.target.innerText);
  //ev.target.select(); 
  //document.execCommand('copy');
  var clipboardCopy = ev.target.firstElementChild.innerText;
  
  navigator.permissions.query({name: "clipboard-write"}).then(result => {
    if (result.state == "granted" || result.state == "prompt") {
      /* write to the clipboard now */
      navigator.clipboard.writeText(clipboardCopy).then(function() {
        /* clipboard successfully set */
        //console.log(':: copied to clipboard ::');
        M.toast({html: 'Copied to clipboard!', classes: 'ebyDashboardRespToast success'});
      }, function() {
        /* clipboard write failed */
        console.log(':: failed to copy to clipboard ::');
      });
    }
  });
});



$(document).ready(function() {
    $(account.init);
  
  	$('#velaQuickAdd').find('button span').text("Save");
    console.log('ran tooltip');
  	var tooltips = document.querySelectorAll('.tooltipped');
  	if (tooltips.length > 0) {
  		M.Tooltip.init(tooltips);
  	}
  	if (window.innerWidth < 991) {
      	$('.ebyaccordionContent').removeClass('active').fadeOut();
        $('.ebyaccordionHeader').removeClass('active');
  	}
  	// box options 
  
  	var referralLinks = jQuery('.ebyShareLink');
  
  	if (referralLinks.length > 0) {
      	
      setTimeout(function() {
      	let referralLink = jQuery('#myReferralLink')[0].innerText;
        console.log(':referralLink:', referralLink);
      	for (let i =0; i < referralLinks.length; i++) {
      		let currLink = referralLinks[i].getAttribute('href');
          	jQuery(referralLinks[i]).attr('href', currLink.replace(':referral_link:', referralLink));
      	}
      }, 1000);
  	}
  
});