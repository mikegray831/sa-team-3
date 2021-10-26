// This function is the webhook's request handler.
exports = function(prescription) {
    var retVal = false;
    var scbs = ['sodium channel blocker', 'tambocor', 'flecainide', 'propafenone', 'rythmol', 'lidocaine', 'mexiletine', 'tocainide', 'phenytoin'];
    retVal = scbs.includes(prescription);
    return retVal;
};
