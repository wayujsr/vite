export const getRuleAttribteSchemaDetails = async function(data) {
    let [cfMapping, ruleMapping, ruleList] = [{},{},[]]
    console.log(data);
    data.map(item => {
        let name = item.rule_name +"."+item.alias;
        if(item.attribute && item.attribute.fields){
            item.fields = item.attribute.fields;
        }
        cfMapping[name] = item;
        if(!ruleMapping[item.rule_name]){
            ruleMapping[item.rule_name] = {name:item.rule_name};
            ruleList.push({text:item.rule_name,value: item.rule_id})
            ruleMapping[item.rule_id] = {name:item.rule_name};
        }
        if(!ruleMapping[item.rule_id]){
            ruleMapping[item.rule_id] = {name:item.rule_name};
        }
        if(!ruleMapping[item.rule_name].alias_list) {
            ruleMapping[item.rule_name].alias_list = [];
            ruleMapping[item.rule_id].alias_list = [];
        }
        ruleMapping[item.rule_name].alias_list.push({text:item.alias, value:item.alias});
        ruleMapping[item.rule_name].id = item.rule_id;
        ruleMapping[item.rule_id].alias_list.push({text:item.alias, value:item.alias});
    });
    // console.log(ruleList, cfMapping, ruleMapping);
    return [ruleList, cfMapping, ruleMapping];
}