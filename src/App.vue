<script>
import HelloWorld from './components/HelloWorld.vue'
import NestedSimple from "./components/Nested.vue"
import draggable from "vuedraggable";
import { DATA_TYPE_LIST, RULE_LIST, OPERATOR_LIST, CUSTOM_FUNCTION_LIST, HYDRA_LIST } from "./Constants.js";
import { SPACE_CLASSIFICATION } from "./SpaceClassification.js";
import { jsGetControlList, getControlAttribute } from "./components/ruleBuilderFunctions.js"
console.log(RULE_LIST)
console.log(SPACE_CLASSIFICATION)
export default {
  name: "createrule",
  components: {
    draggable,
    NestedSimple,
  },
  props: {
    isJourney: String,
    data: Object
  },
  data: function() {
    return {
      counter: 1,
      dateData: {},
      approvalValue: {},
      dateAttributeList: [],
      simpleNested:{
        exp: [""],
        refr: [""],
        tasks: [],
        isNot: false,
        dateConfig: [],
        depth: 1
      },
      isVisible: false,
      list1: [
        { name: "search_context", id: 1 ,tasks: [], type: "textarea"},
        { name: "last_sc", id: 1 ,tasks: [], type: "textarea"},
        { name: "Travel Date", id: 2 ,tasks: [], type:"calenders"},
        { name: "sector", id: 3 ,tasks: [], type:"multiselects"},
        { name: "journey_type", id: 4 ,tasks: [],type:"multiselects"},
        { name: "sbu_domain", id: 5 ,tasks: [], type:"dropdown"},
        { name: "profile_type", id: 6 ,tasks: [], type:"dropdown"},
        { name: "days_since_drop_off", id: 7 ,tasks: [], type:"number"}
      ],
      localData: [],
      publisherState: "DRAFT",
      publisherObjectLink: {},
      linkAffect: {},
      stateMeta: {},
      publisherInfo: {},
      publishInfo: {},
      formFields: [
        {
          type: "input",
          label: "Name",
          v_model: "name",
          prefix: "r_",
          placeholder: "Enter Name"
        },
        {
          type: "textarea",
          label: "Description",
          v_model: "ruleDescription"
        },
        {
          type: "model-list-select",
          label: "Lob",
          list: "lobList",
          option_text: "friendly_name",
          option_value: "id",
          v_model: "ruleLob",
          url: "#/create/lob/"
        },
        {
          type: "model-list-select",
          label: "Select Output data type",
          option_text: "name",
          option_value: "id",
          list: "dataTypeList",
          v_model: "outputDataType",
          url: "#/create/dataType/"
        }
      ],
      responseId: "",
      directToRuleSet: false,
      cusFuncMapping: {},
      atJsListObject: {
        customFunctionNameList: [],
        customVariableList: []
      },
      rawCustomFunctionList: [],
      rawCustomFunctionApiList: [],
      lobList: [],
      messageContentList: [],
      queryList: [],
      restApiList:[],
      deviceHydraSegments: [],
      nestedOperatorList: [],
      nestedDatatypeList: [],
      operatorMapping: {},
      attributesMapping: {},
      dataList: {},
      controlList: [],
      userHydraSegments: [],
      deviceHydraSegmentsCode: [],
      userHydraSegmentsCode: [],
      hydraTags: {},
      nameSpaceEditable: true,
      errorMessage: "",
      expressionTobeExported: "",
      dismissSecs: 5,
      dismissCountDown: 0,
      name: "",
      ruleLob: "",
      ruleTypeList: ["inclusion", "exclusion"],
      loader: true,
      ruleDescription: "",
      ruleType: "inclusion",
      putRequest: {
        status: false,
        id: ""
      },
      creationInfo: {
        cr_by: "",
        cr_at: "",
        up_by: "",
        up_at: ""
      },
      ruleList: [],
      deeplinkArray: [],
      CfCfApiReference: {},
      controlAttrMapping: {},
      // urls: this.$store.state.urls,
      subRuleExpression: "",
      subRuleExpressionResult: "",
      customFunctionNameList: [],
      customFunctionApiNameList: [],
      customVariableList: [],
      queryBuilderFunctionsList: [],
      queryBuilderAttributesList: [],
      queryBuilderVariablesList: [],
      dataTypeList: [],
      cfRuleObj: {},
      expressionInText: "",
      searchedText: "",
      expression: "",
      expressionRaw: "",
      showMVL: "",
      expressionQueryJson: [],
      evaluationTree: "[]",
      modified_evaluation_tree: [],
      rootObjectKeyName: "root",
      attributePrefix: [
        '${attribute-',
        '{content-custom-variable-',
        '{custom-variable-',
        '{fs-','}'
      ],
      queryObj: {
        expression: [],
        preview: ""
      },
      oldQueryObj: {
      },
      ruleSubTypeList: ["evaluation_tree", "expression", "query_builder", "rule_builder"],
      ruleSubType: "rule_builder",
      outputDataType: "",
      expressionRule: "",
      publishedID: "",
      elementVisible: true,
      setInfo: {
        active: true,
        tags: [],
        namespace: window.localStorage.getItem("globalNamespace") ? window.localStorage.getItem("globalNamespace") : ""
      },
      shouldContentLoad: false
    };
  },
  watch: {
    simpleNested:{
      handler(val) {
        this.expressionRule = val.exp[0];
      },
      deep:true
    },
    name(newValue,old){
      if(this.ruleDescription === old){
        this.ruleDescription = newValue;
      }
    },
    localData(n,o){
    },
    queryObj: {
      handler(val) {
        this.moveCursorToDiv();
      },
      deep:true
    },
  },
  beforeDestroy: function () {
    // console.log("destory")
    this.data = {};
    this.simpleNested = {
      exp: [""],
      refr: [""],
      tasks: [],
      isNot: false,
      dateConfig: [],
      depth: 1
    };
    this.dataList = {};
    this.atJsListObject = {
      customFunctionNameList: [],
      customVariableList: []
    };
    this.cusFuncMapping = {};
    this.rawCustomFunctionList = [];
    this.rawCustomFunctionApiList = [];
    this.lobList = [];
    this.messageContentList = [];
    this.queryList = [];
    this.restApiList =[];
    this.deviceHydraSegments = [];
    this.nestedOperatorList = [];
    this.nestedDatatypeList = [];
    this.operatorMapping = {};
    this.attributesMapping = {};
    this.dataList = {};
    this.controlList = [];
    this.userHydraSegments = [];
    this.deviceHydraSegmentsCode = [];
    this.userHydraSegmentsCode = [];
    this.hydraTags = {};
    this.deeplinkArray = [];
    this.CfCfApiReference = {};
    this.controlAttrMapping = {};
    this.urls = this.$store.state.urls;
    this.customFunctionNameList = [];
    this.customFunctionApiNameList = [];
    this.customVariableList = [];
    this.queryBuilderFunctionsList = [];
    this.queryBuilderAttributesList = [];
    this.queryBuilderVariablesList = [];
    this.dataTypeList = [];
    this.cfRuleObj = {};
    // this.$el.parentNode.removeChild(this.$el);
  },
  mounted() {
    document.body.classList.remove("sidebar-lg-show");
  },
  computed: {
    computeSearch(){
      return this.localData.filter(item => {
        if((item.name).toLowerCase().indexOf((this.searchedText).toLowerCase()) !== -1){
          return item;
        }
      });
    },
    computeNot(){
      return this.simpleNested.isNot === true ? "not" : "";
    },
    messageAtList() {
      return this.$store.state.getMessageAt;
    },
    computeRuleExpression(){
      // this.simpleNested
      return "text";
    },
    computedDisabled() {
      return false;
    },
    checkValidation() {
      if (this.$route.params.id) {
        if (!this.nameSpaceEditable) {
          return true;
        }
      }
      return false;
    }
  },
  created:function() {
    // this.$store.dispatch('isValidArrayFilterSchema',false)
    // this.$store.dispatch("arrayFilterActive", false);
    // this.$Progress.start();
    // this.isSuperUser = this.$getCookie("super-user") === "true" ? true : false;
    // let header = this.$store.state.dataHeader;
    let spaceClassification = [];
      console.log("if start");
      let arr = [
        "smartDatatypes",
        "publishedRulesR",
        "smartOperators",
        "publishedCustomFunction",
      ];
      // let obj = await this.$loadDependencies(arr);
      console.log(RULE_LIST)
      // this.ruleList = [...RULE_LIST];
      // console.log(this.ruleList);
      const valuedData = jsGetControlList(SPACE_CLASSIFICATION);
      console.log(valuedData)
      this.controlList = JSON.parse(JSON.stringify(valuedData[0]))
      this.controlAttrMapping =  valuedData[1]
      this.localData = JSON.parse(JSON.stringify(valuedData[0]))
      console.log(this.localData)
      this.dataList.datatype = DATA_TYPE_LIST;
      this.dataList.operators = [{id:"",name:"None"}].concat(OPERATOR_LIST);
      this.dataList.operatorMapping = this.getOperatorMapping(OPERATOR_LIST);
      this.dataList.datatypeMapping = this.getDatatypeMapping(DATA_TYPE_LIST);
      this.dataList.datatype.map((item, i) => {
      if (item.name === "Boolean") {
        this.outputDataType = item.id;
        }
      });
      this.lobList.map((item, i) => {
        if (item.friendly_name === "DataPlatform") {
          this.ruleLob = item.id;
        }
      });
      this.dataTypeList = DATA_TYPE_LIST;

      this.rawCustomFunctionList = CUSTOM_FUNCTION_LIST.filter(item => {
        return item.custom_function_type === "target"
      });

      // this.CfCfApiReference = this.$getCfCfApiReference([
      //   {
      //     list: CUSTOM_FUNCTION_LIST,
      //     name: "CF"
      //   }
      // ]);

      this.rawCustomFunctionList.map((item,i)=> {
        this.CFMapping = Object.assign({[item.name]: item.id}, this.CFMapping)
      });

      // let customFunctionList = this.$getAtJsCustomFunctionList(
      //   CUSTOM_FUNCTION_LIST
      // );
      // this variable is used in my-vue-plugin file
      // this.customFunctionNameList = customFunctionList;
      // this.atJsListObject.customFunctionNameList = customFunctionList;
      // customFunctionList.map((item,i)=>{
      //   this.queryBuilderFunctionsList.push({ text: "#"+item.name, value: "#"+item.name });
      // });
      // this.$assignAtJsList(this.atJsListObject);

      try {
        
        // console.log("inner ajax")
        this.deviceHydraSegments = [];
        this.userHydraSegments = [];
        this.deviceHydraSegmentsCode = [];
        this.userHydraSegmentsCode = [];
        this.hydraTags = {};
        console.log(HYDRA_LIST)
        Object.values(HYDRA_LIST.data).map((itemi,i)=>{
            itemi.map((itemj,j)=>{
              Object.values(itemj).map((hydra,ind)=>{
                  this.hydraTags[hydra.tags.segment_name] = hydra.tags;
                  this.hydraTags[hydra.tags.segment_code] = hydra.tags;
                  let obj = {
                      text: hydra.tags.segment_name,
                      value: hydra.tags.segment_name
                  };
                  let code = {
                    text: hydra.tags.segment_code,
                    value: hydra.tags.segment_code
                  }
                  if(hydra.entity === "device"){
                    this.deviceHydraSegments.push(obj);
                    this.deviceHydraSegmentsCode.push(code);
                  } else {
                    this.userHydraSegments.push(obj);
                    this.userHydraSegmentsCode.push(code);
                  }
              });
            });
        });
          // this is to combine hydra segments tag & name
          this.userHydraSegments = this.userHydraSegments.concat(this.deviceHydraSegments, this.deviceHydraSegmentsCode, this.userHydraSegmentsCode);
        
      }catch(e){
        console.log(e.response.data)
        this.errorMessage = e.response.data
        this.showAlert();
        this.$Progress.fail();
      }


    this.dataTypeList.map((item, i) => {
      if (item.name === "Boolean") {
        this.outputDataType = item.id;
      }
    });
    this.lobList.map((item, i) => {
      if (item.friendly_name === "DataPlatform") {
        this.ruleLob = item.id;
      }
    });
    
    let [classification,spaceMapping,attributeMapping,fieldsMapping,cfRuleList,cfRuleShapeMapping,cfRuleAliasMapping] = getControlAttribute(SPACE_CLASSIFICATION);
    // let [cfRuleList,cfRuleShapeMapping,cfRuleAliasMapping] = await this.$getCusFuncRuleShape();
    this.ruleAttrObj = {
      classificationList: classification,
      controlList: spaceMapping,
      controlAttrMapping: attributeMapping,
      attrMapping: fieldsMapping,
      ruleList : cfRuleList,
      ruleShapeMapping : cfRuleShapeMapping,
      ruleAliasMapping : cfRuleAliasMapping
    }
    this.cfRuleObj = {
      list : cfRuleList,
      shapeMapping : cfRuleShapeMapping,
      aliasMapping : cfRuleAliasMapping
    }

    // console.log("after if else");
    let cusFuncList = this.rawCustomFunctionList.map(item => {
      this.cusFuncMapping = Object.assign({[item.id]:item},this.cusFuncMapping);
      item.attribute =  {
        name : item.name,
        alias : "sample",
        datatype : item.data_type,
        custom_function_param: item.custom_function_param,
        possible_values : "",
        expression : "sample",
        sample_value : "",
      }
      return item;
    })

    let hydraData = [{
        name:"Hydra_segment",
        ui_expression:"",
        id:"hydra_segment_id",
        attributes:[
          {
            attribute: {
              datatype: "hydra",
              id:"User",
              name: "User"
            }
          },
          {
            attribute: {
              id:"Device",
              datatype: "hydra",
              name: "Device"
            }
          }
        ]
      },
      {
        name:"rule",
        ui_expression:"",
        id:"rule_id",
        value:[],
        attributes: []
      },
      {
        name:"rule_attributes",
        ui_expression:"",
        id:"rule_attribute_id",
        value:[],
        attributes: []
      },
      {
        name: "date_diff",
        ui_expression: "",
        id:"date_diff_id",
        value: [],
        attributes: []
      },
      // {
      //   name: "attr",
      //   ui_expression: "",
      //   value: [],
      //   attributes: []
      // },
      {
        name:"enrich",
        id:"enrich_id",
        ui_expression:"",
        value:[],
        attributes: []
      },
      {
        name:"splitAB",
        id:"split_ab_id",
        ui_expression:"",
        value:[],
        attributes: []
      },
      {
        name:"concat",
        id:"concat_id",
        ui_expression:"",
        value:[],
        attributes: []
      },
      {
        name:"Array Filter",
        ui_expression:"",
        id:"array_filter_id",
        value:[],
        attributes: [],
        cfParams:['attribute','predicate']
      },
      {
        name: "array item",
        ui_expression:  "",
        params_index:  2,
        id: "array_attribute_params",
        value: [],
        attributes: [],
      },
      {
        name:"custom functions",
        ui_expression:"",
        id:"custom_function_id",
        value:[],
        attributes: cusFuncList
      },
      {
        name:"rest_api",
        ui_expression:"",
        id:"rest_api_id",
        value:[],
        attributes: []
      },
      {
        name:"text",
        id:"text_id",
        ui_expression:"",
        value:[{
          expression:"",
          ui_expression:""
        }],
        attributes:[]
      },
      ]
    let [compiledHydra, controlAttrMapping] = jsGetControlList(JSON.parse(JSON.stringify(hydraData)));
    this.localData.unshift(compiledHydra[0])
    this.localData.push(compiledHydra[1],compiledHydra[2],compiledHydra[3],compiledHydra[4],compiledHydra[5],compiledHydra[6],compiledHydra[7],compiledHydra[8],compiledHydra[9],compiledHydra[10])
    this.controlList = JSON.parse(JSON.stringify(this.localData))
    this.controlAttrMapping = controlAttrMapping;


    let dateList;
    this.customVariableList.filter(item => {
      if(item.name === "rule_builder_date_config"){
        dateList = item;
      }
    })
    // this.restApiList = await this.$getCall(this.urls.getRestApiList);
    // this.dateData = await this.$getCall(this.urls.customVariable + dateList.id);
    // this.simpleNested.dateConfig = this.dateData.meta

  },
  methods: {
    checkMove(e){
    if(e.draggedContext.element.name === 'rest_api' && e.to.childElementCount > 0){
      return false;
    } else if(this.simpleNested.tasks.length && this.simpleNested.tasks[0].name === 'rest_api'){
      return false
    } else if(e.draggedContext.element.name === 'rest_api' && this.simpleNested.tasks.length && this.simpleNested.tasks[0].name !== 'rest_api' ){
      return false
    }
    },
    toggleShow(i){
      let value = this.computeSearch[i].show
      this.$set(this.computeSearch[i],'show',!value)
      // this.localData[i].show = !this.localData[i].show
    },
    getDatatypeMapping(arr){
      let datatypeMapping = {};
      arr.map((item,i) => {
        datatypeMapping[item.name.toLowerCase()] = {
          id : item.id,
          name : item.name.toLowerCase(),
          allowed_operators : item.allowed_operators,
        }
      });
      datatypeMapping = Object.assign({"hydra":{
        id: "hydra",
        name: "hydra",
        allowed_operators: ['CNT', 'NCNT', 'IN', 'NIN', 'IsNull', 'IsNotNull']
      }},datatypeMapping)
      return datatypeMapping;
    },
    getOperatorMapping(arr){
      let operatorMapping = {};
      arr.map((item,i) => {
        operatorMapping[item.id] = {
          id : item.id,
          name : item.name,
          symbol : item.symbol,
          category : item.category,
        }
      });

      let hydraOperators = ['CNT', 'NCNT', 'IN', 'NIN', 'IsNull', 'IsNotNull']
      hydraOperators.map((item,i) => {
        operatorMapping[item] = {
          id : item,
          name : item,
          symbol : item,
          category : item,
        }
      })

      return operatorMapping
    },
    log: function(evt) {
      window.console.log(evt);
      this.localData = JSON.parse(JSON.stringify(this.controlList));
      // let index = evt.removed.oldIndex
      // let item = JSON.parse(JSON.stringify(evt.removed.element));
      // console.log("removed");
      // item.id = evt.removed.element.id + 1000;
      // this.localData.splice(index,0,item);
    },
    moveCursorToDiv() {
      let flag = this.$route.fullPath;
      window.setTimeout( (e) => {
        $(".preview-expression a").click( e => {
          window.setTimeout( (e) => {
            // console.log(window.location.hash,"#"+flag)
            if(window.location.hash !== "#"+flag) {
              // console.log('if condition')
              window.location = "#"+flag;
            }
          },40);
        });
      },40);
    },
    hiddenRuleEnhance(){
      console.log("hiddenRuleEnhance");
    },
    saveRuleEnhance(){
      console.log("saveRuleEnhance");
    },
    fillForm(data) {
      this.loader = false;
      this.putRequest = {
        status: true,
        id: data.publisher_meta.DRAFT
      };
      this.creationInfo = {
        cr_by: data.created_by_user.email,
        cr_at: this.$getDesiredDateFromDateString(data.created_at),
        up_by: data.updated_by_user.email,
        up_at: this.$getDesiredDateFromDateString(data.updated_at)
      };
      if(!Object.keys(data.references).length){
        this.errorMessage = "References are not generated for this rule."
        this.showAlert();
      }
      this.publishedID = data.publisher_meta.PUBLISHED;
      this.$store.commit('resetRestAttributes');

      // .....for rest api rule
      if(data.references_details && data.references_details.rest_attributes){
        this.$store.commit('setRestAttributes',data.references_details.rest_attributes)
      }
      this.name = data.name;
      this.ruleLob = data.lob;
      this.ruleConditional = data.is_conditional_split;
      this.ruleDescription = data.description;
      this.ruleSubType = data.rule_sub_type;
      this.outputDataType = data.output_data_type;
      if(data.rule_builder_json === null) {
        this.simpleNested.isNot = false;
        this.simpleNested.exp[0] = "";
        this.simpleNested.refr[0] = "";
        this.simpleNested.tasks = [];
      }else {
        this.simpleNested = data.rule_builder_json;
        if(data.rule_builder_json.tasks && data.rule_builder_json.tasks.length){
          // validation to populate arrayFilter Schema
          data.rule_builder_json.tasks.map(item => {
            if(item.name === "Array Filter"){
              this.$store.dispatch("arrayFilterActive", true);
              if(data.rule_builder_json.array_filter_schema && data.rule_builder_json.array_filter_schema.length){
                this.$store.dispatch("isValidArrayFilterSchema", true);
                this.$store.dispatch('arrayFilterSchema', data.rule_builder_json.array_filter_schema);
              }
            }
          });
        }
      }
      this.simpleNested.dateConfig = this.dateData.meta
      this.subRuleExpressionResult = data.input_ui_expression;
      this.rootObjectKeyName = data.name;
      this.publisherState = data.publisher_state;
      this.publisherObjectLink = data.publisher_linked;
      this.stateMeta = data.publisher_meta;
      this.publisherInfo = data.publisher_info;
      this.approvalValue = {
        approvalFlag: true,
        contentApproval: {
          flag: data.approval_flags && data.approval_flags.content_checker && data.approval_flags.content_checker.status,
          by: data.approval_flags && data.approval_flags.content_checker && data.approval_flags.content_checker.action_by,
          at: data.approval_flags && data.approval_flags.content_checker && this.$getDate(Number(data.approval_flags.content_checker.action_at)),
          remarks: data.approval_flags && data.approval_flags.content_checker && data.approval_flags.content_checker.remarks,
        },
        lobApproval: {
          flag: data.approval_flags && data.approval_flags.lob_checker && data.approval_flags.lob_checker.status,
          by: data.approval_flags && data.approval_flags.lob_checker && data.approval_flags.lob_checker.action_by,
          at: data.approval_flags && data.approval_flags.lob_checker && this.$getDate(Number(data.approval_flags.lob_checker.action_at)),
          remarks: data.approval_flags && data.approval_flags.lob_checker && data.approval_flags.lob_checker.remarks,
        },
        clmApproval: {
          flag: data.approval_flags && data.approval_flags.checker_maker_approver && data.approval_flags.checker_maker_approver.status,
          by: data.approval_flags && data.approval_flags.checker_maker_approver && data.approval_flags.checker_maker_approver.action_by,
          at: data.approval_flags && data.approval_flags.checker_maker_approver && this.$getDate(Number(data.approval_flags.checker_maker_approver.action_at)),
          remarks: data.approval_flags && data.approval_flags.checker_maker_approver && data.approval_flags.checker_maker_approver.remarks,
        },
        url: this.urls.rulesPublish,
        routeId: data.publisher_meta.DRAFT,
        type: "rule",
        sub_type: "",
        approvalDesignInline: true,
        mtNeg30: true
      }
      if (
        data.publisher_submitted_at &&
        data.publisher_modified_at &&
        data.publisher_submitted_by &&
        data.publisher_modified_by
      ) {
        this.publishInfo = {
          created: this.$getDesiredDateFromDateString(
            data.publisher_submitted_at
          ),
          modified: this.$getDesiredDateFromDateString(
            data.publisher_modified_at
          ),
          createdBy: data.publisher_submitted_by.email,
          modifiedBy: data.publisher_modified_by.email
        };
      }
      this.linkAffect = data.link_info;

      this.setInfo = {
        active: data.is_active,
        tags: data.tags,
        namespace: data.namespace
      };
      this.shouldContentLoad = true;
    },
    removeRow(e) {
      this.deeplinkArray.splice(e, 1);
    },
    addDeeplinkRow() {
      this.deeplinkArray.push({});
    },
    getDeeplinkOptions(e, j) {
      let count = 0;
      this.deeplinkArray.map((item, i) => {
        if (item.lhs === e.target.value) {
          count++;
        }
        if (count > 1) {
          this.deeplinkArray[j].lhs = "";
          alert("Duplicate entry of deeplink parameter");
        }
      });
    },
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    showAlert() {
      this.loader = false;
      this.dismissCountDown = this.dismissSecs;
    },
    expressionString(type) {
      let i,
        status = false,
        selectedExpression = [];

      $("#builder-basic")
        .find(".rule-filter-container select")
        .each((i, item) => {
          selectedExpression.push({
            id: $(item).val(),
            name: $(item)
              .find(":selected")
              .text()
          });
          if ($(item).val() == -1) {
            status = true;
            return false;
          }
        });
      if (status) {
        return; // if error in query builder
      }
      let result = $("#builder-basic").queryBuilder("getSQL", "question_mark");
      let expression = result.sql
        .replace(/[\?\=]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      let expressionInNames;

      var MVLCreation = expression;
      this.expressionTobeExported = expression;

      for (let j = 0; j < selectedExpression.length; j++) {
        let data = selectedExpression[j];
        if (expression.includes(data.id)) {
          this.queryList.forEach(item => {
            if (data.name === item.label) {
              this.expressionTobeExported = this.expressionTobeExported.replace(
                new RegExp(data.id, "g"),
                item.expression
              );
              MVLCreation = MVLCreation.replace(
                new RegExp(data.id, "g"),
                "<a class='pop-text' href=/?#/create/rule/" +
                  data.id +
                  " target='_blank'>" +
                  data.name +
                  "</a>"
              );
            }
          });
          expression = expression.replace(new RegExp(data.id, "g"), data.name);
        }
      }
      let expressionInArray = expression.split(" ");
      let queryJson = expressionInArray.map((item, i) => {
        let raw = {};
        this.queryList.filter((data, i) => {
          if (item === data.label) {
            raw.name = data.label;
            raw.id = data.id;
            raw.type = "rule";
          } else {
            raw.name = item;
          }
        });
        return raw;
      });
      this.expressionQueryJson = queryJson;
      let queryJsonString = "";
      queryJson.map((item, i) => {
        if (item.id) {
          queryJsonString +=
            " ${" + item.type + "." + item.id + "." + item.name + "}";
        } else {
          queryJsonString += " " + item.name;
        }
      });

      this.expression = queryJsonString.trim();
      this.expressionRaw = expression;
      this.showMVL = MVLCreation;
    },
    listCreationForMessageDropdown() {
      var i;
      this.expressionString();

      if (!this.expression) {
        this.expressionInText = "";
        return;
      }

      this.expressionInText = this.showMVL;
      let expressionArray = this.expressionRaw.split(" ");
      expressionArray = expressionArray.filter((item, i) => {
        return item.replace(/[\AND\OR\NOT\(\)]/g, "");
      });

      var expressionLabel = [];
      for (let i = 0; i < expressionArray.length; i++) {
        for (let j = 0; j < this.queryList.length; j++) {
          if (this.queryList[j].attrId !== "") {
            expressionLabel.push(this.queryList[j].attrName); // to put lhs name into list
          }
          if (expressionArray[i] === this.queryList[j].label) {
            expressionLabel.push(this.queryList[j].label);
          }
        }
      }

      this.messageContentList = expressionLabel;
      this.messageContentList = this.messageContentList.filter(
        (value, index, self) => {
          return self.indexOf(value) === index; // get only unique list
        }
      );

      this.messageContentList = this.messageContentList.map(item => {
        return `{${item}}`;
      });
    },
    getRuleSetCookie() {
      this.directToRuleSet = true;
      this.submitForm();
      this.directToRuleSet = false;
      // this.hideModal();
      this.successMessageHide();
    },
    hideModal() {
      this.$root.$emit("bv::hide::modal", "showSuccessMessage");
    },
    returnText() {
      let div = document.createElement("div")
      div.innerHTML = this.queryObj.preview;
      return div.innerText
    },
    // recursionNested(arr,depth){
    //   let newDepth = depth+1
    //   arr.map((item,i) => {
    //     console.log(depth,i)
    //     if(item.tasks && item.tasks.length){
    //       this.recursionNested(item.tasks,newDepth)
    //     }
    //   })
    // },
    getHydraStruct(type){
      return {
        type_of_node: "function",
        properties: {
          id: type,
          name: type,
          arguments: []
        }
      }
    },
    getCustomFunctionStruct(type_of_node, attribute, cusFunc, shape){
      let struct;
      let arr = [
        {
          type_of_node: 'feature',
          properties: {
            name: attribute
          }
        }
      ]
      struct = {
        type_of_node: "attribute",
        properties: {
          id : cusFunc,
          name : attribute,
          nested_path: shape,
        }
        // attributePath: [shape]
      };
      return struct;
    },
    // ............rest api rule
    getAliasValue(data, obj) {
        if (data.fields && data.fields.length) {
          obj[data.name] = {}
          this.formatExpression(data.fields, obj[data.name])
        } else if (data.aliases && this.$store.state.restAttributes[data.aliases]) {
          obj[data.name] = `@@~~${data.aliases}~~@@`
        } else {
          obj[data.name] = data.sample_value
        }
        return obj
      },

      formatExpression(res, obj = {}) {
        if (Array.isArray(res)) {
          res.map(data => {
            if (data.datatype === 'array') {
              let result = data.fields.map(element => {
                return this.formatExpression(element)
              })
              obj[data.name] = [...result]
            } else {
              this.getAliasValue(data, obj)
            }
          });
        } else {
          this.getAliasValue(res, obj)
        }
        return obj
      },
      normalizeRestApiExpression(expr){
         try { 
            const restApiExpr = this.formatExpression(this.simpleNested.tasks[0].tasks[0].rest_api_tasks[0].fields)
            if(!restApiExpr.body){
              restApiExpr.body = {}
            }
            if(!restApiExpr.headers){
              restApiExpr.headers = {}
            }
            /**
             * @splitExpression 0: "#attribute_1@@@getRestApi(https://google.com,GET,auth,go123,3000"
                                1: " is not null"
             */
            const splitExpression = expr.split(')')
            return  {expr: splitExpression[0]+`,${JSON.stringify(restApiExpr)})`+splitExpression[1] }
         } catch(err) {
            console.log("🚀 ~ file: CreateRuleBuilder.vue ~ line 1390 ~ normalizeRestApiExpression ~ err", err)
         }
      },

    submitForm: async function(val) {
      if(!this.$store.state.isArrayFilterValid){
        this.errorMessage = "The composition for Array Filter is not valid. Please pick an attribute with an array data type only."
        this.showAlert();
        return false
      }
      this.isVisible = false;
      if(this.$store.state.isValidArrayFilterSchema && this.$store.state.isArrayFilterActive){
        //  if array filter is valid
        let flag = false;
        this.simpleNested.tasks.map((item,i) => {
          if (i === 0 && item.tasks.length === 2){
            flag = true;
            if(this.$store.state.arrayFilterSchema && this.$store.state.arrayFilterSchema.length){
              this.simpleNested.array_filter_schema = this.$store.state.arrayFilterSchema;
            }else{
              flag = false;
            }
          }else{
          }
        })
        if(!flag){
          console.log("flag true")
          // this.errorMessage = "Array Filter parameters mis-match."
          // this.showAlert();
          // return false
        }
      }

      if($(".is-invalid").length){
        this.errorMessage = "Rule contains some error, please fix to proceed."
        this.showAlert();
        return false
      }

      if(this.name === "" || this.name.includes("___")){
        this.errorMessage = "Please fill rule name OR rule name contains triple underscore e.g. '___' , please correct"
        this.showAlert();
        return false
      }

      let componentData = this.$store.state.classifications;
      let isActiveCheck = true;
      if(componentData && !componentData.active && !this.$store.state.cloneMeta.status){
        isActiveCheck = false;
        isActiveCheck = confirm("Rule is not Active, do you still want to continue?")
        if(!isActiveCheck){
          return false;
        }
      }
      console.log(this.simpleNested.refr[0]);
      let expr = this.$messageDecode(this.computeNot + this.simpleNested.refr[0], this.messageAtList);
      let restApiId = ''
      let customFunctionId = ''
      if(this.simpleNested.refr[0].includes('restApi')){
        if(!(this.simpleNested.tasks && this.simpleNested.tasks.length && this.simpleNested.tasks[0].tasks.length)){
             alert('Rest api is not selected')
             return;
        }
         // ....check if rest api rule contains rest api id && custom function id
         restApiId = this.simpleNested.tasks[0].rest_api_id
         customFunctionId = this.simpleNested.tasks[0].custom_function_id
          if(!customFunctionId){
            alert('Custom function id is missing')
            return;
          }
          if(!restApiId){
             alert('Rest api id is missing')
            return;
      }
        const result  = this.normalizeRestApiExpression(expr);
        expr = result.expr;
      }
     
     console.log(expr);
      // let  expr = "(  ${attribute_reference.ff7c439c-cbb5-4e7c-afe2-f70ba832e8d1} is not null or  #enrich(  ${attribute_reference.d37efc15-8488-46ae-b589-afc635477f60}.hotel_code ,  ${attribute_reference.5a119cb4-be24-4d8a-9c60-63e42d64b57b}.name ) )";
      let ref = await this.$getReferences(expr,this.CfCfApiReference,'rule',(this.$store.state.isValidArrayFilterSchema && this.$store.state.isArrayFilterActive));
      let rule_ref = ref.rules;
      delete ref.rules;
      // to remove @@@ from expression because of alias
      
      expr = expr.replace(/[$#^]/g, ' $&');
      let expr_arr = expr.includes("restApi") ?  [expr] : expr.split(" ")
      let expr_join = expr_arr.map(item => {
        // ...........add reference for rest api attributes
        if(item.includes("restApi")){
          if(customFunctionId && ((ref.custom_functions.length && ref.custom_functions.some(data => data !== customFunctionId)) || ref.custom_functions.length === 0)){
            ref.custom_functions.push(customFunctionId)
          }
          ref.rest_api =[restApiId]
          ref.rest_attributes = this.$store.state.restAttributes
          Object.keys(ref.rest_attributes).forEach(key => {
            const element = ref.rest_attributes[key]
            const expSyntax = "${attribute_reference."
            const elementIndex = element.indexOf(expSyntax)
            // const cfExpSyntax = "${custom_attribute_reference."
            // const cfElementIndex = element.indexOf(cfExpSyntax)
            if(elementIndex > -1){
              const id = element.substring(elementIndex + expSyntax.length, elementIndex + expSyntax.length + 36)
              ref.attributes.push(id)
            } 
            // else if(cfElementIndex > -1){
            //   const id = element.substring(cfElementIndex + cfExpSyntax.length, cfElementIndex + cfExpSyntax.length + 36)
            //   ref.attributes.push(id)
            // }
          })                   
          expr = expr.split('@@@')
          expr = '#'+ expr[1]
          return expr
        } else if (item.startsWith("#")) {
          let index = item.indexOf("(");
          let name = item.substring(1,index);
          if(name.split("@@@").length > 1){
            name = name.split("@@@")[1]
          }
          item = "#"+name+"("
        }else if(item.startsWith("${attribute_reference")){
          let handlingForAttrAlias = ""
          if(item.includes(".attribute_")){
            handlingForAttrAlias = "}";
          }
          let value = item.split(".");
          let shape = item.substring((item.indexOf("}") + 1),item.length)
          item = value[0] +"."+ value[1] + handlingForAttrAlias + shape
        }else if(item.startsWith("${custom_attribute_reference")){
          let handlingForAttrAlias = ""
          if(item.includes(".attribute_")){
            handlingForAttrAlias = "}";
          }
          let value = item.split(".");
          let shape = item.substring((item.indexOf("}") + 1 ),item.length)
          item = value[0] +"."+ value[1] + handlingForAttrAlias + shape
        }
        return item;
      })
      let data = {
        rule_type: this.ruleType,
        name: this.$removeAscii(this.name),
        description: this.$removeAscii(this.ruleDescription) ? this.$removeAscii(this.ruleDescription) : "description " + this.$removeAscii(this.name),
        expression: expr_join.join(" ").replace(/\s+/g,' ').trim(),
        references: ref,
        rule_references: rule_ref,
        output_data_type: this.outputDataType,
        rule_sub_type: this.ruleSubType,
        ui_expression: this.expression,
        expression_raw: this.expressionRaw,
        ui_expression_query_json: this.expressionQueryJson,
        ui_expression_json: "",
        rule_builder_json: this.simpleNested,
        lob: this.ruleLob,
        namespace: componentData.namespace.value,
        is_active: componentData.active,
        evaluation_tree: JSON.parse(this.evaluationTree)
      };
      
      let tags = [];
      componentData.tags.map((item, i) => {
        tags.push(item.value);
      });
      console.log(data)
      // return;

      data.tags = tags;
      if (this.$store.state.cloneMeta.status) {
        data.name = this.$store.state.cloneMeta.name;
      }
      let dtl = this.$getCommonDetails(this.urls.rulesPublish);
      if (data.name && data.name.substring(0,2) !== "r_") {
        data.name = "r_" + data.name;
      }
      if (this.directToRuleSet) {
        data.id = this.$route.params.id;
        document.cookie = "rule-set=" + JSON.stringify(data);
        return;
      }
      this.$commonSubmit(dtl.url, data, dtl.callType)
    },
    successMessageHide:async function(e) {
      if (this.isJourney === "true") {
        // this.$root.$emit("bv::hide::modal", "notification");
        this.$root.$emit("bv::hide::modal", "showSuccessMessage");
        await this.$checkParamsAndFillForm(this.urls.rulesPublish, this.responseId);
        this.$store.commit("isJourney", true);
        this.$emit("refreshListingApi",['rule',this.publishedID]);
      } else {
        this.$router
          .push({
            name: "Edit Rule Builder ID",
            params: { id: this.responseId }
          })
          .catch(e => {});
        this.$checkParamsAndFillForm(this.urls.rulesPublish);
        this.$root.$emit("bv::hide::modal", "showSuccessMessage");
      }
    }
  }
};
</script>

<template>
  <h1>Rule Builder</h1>
  <div class="bg-white-pos-r row">
    <b-col sm="12" lg="12">
      <b-card no-body>
        <!-- <div slot="header">
          <strong>Create Rule</strong>
          <div class="update-info" v-html="computeInfo"></div>
        </div> -->
        <b-row>
            <!-- <CommonFormFields :formFields="formFields" :_this="this"></CommonFormFields> -->
            <div class="col-sm-12">
              <fieldset>
                <div class="rule-builder-outer">
                  <div class="row">
                    <div class="col-2">
                      <div class="list-group left"  v-for="(item,i) in computeSearch" :key="i">
                        <template v-if="item.spaces && item.spaces.length">
                          <div>
                            <div class="list-group-item">
                              {{item.name}}
                              <span class="float-right link" @click="toggleShow(i)"><i :class="item.show ? 'fa fa-compress' : 'fa fa-expand'"></i></span>
                            </div>
                            <draggable :style="{'display':item.show ? 'block' :'none'}" :data-value="item.show" class="list-group left ml-3" :list="item.spaces" group="people" :sort="true" :move="checkMove">
                              <div
                                class="list-group-item inner"
                                v-for="(element, index) in item.spaces"
                                :key="index"
                                :drag="false"
                              >
                                {{ element.name }}
                              </div>
                            </draggable>
                          </div>
                        </template>
                        <template v-else>
                          <template v-if="item.spaces && item.spaces.length === 0">
                            <!-- <div class="list-group-item">
                              {{item.name}} -->
                              <!-- <span class="float-right link" @click="toggleShow(i)"><i :class="item.show ? 'fa fa-compress' : 'fa fa-expand'"></i></span> -->
                            <!-- </div> -->
                          </template>
                          <template v-else>
                            <draggable class="list-group left" :list="[item]" group="people" :sort="true" :move="checkMove">
                              <div
                                class="list-group-item"
                                v-for="(element, index) in [item]"
                                :key="index"
                                :drag="false"
                              >
                                {{ element.name }}
                              </div>
                            </draggable>
                          </template>
                        </template>
                      </div>
                    </div>
                    <div class="col-10 canvas-panel">
                      <div style="background:#ffffff; display:none;">
                      </div>
                      <div class="dragArea">
                        <div style="margin-left: -20px" :class="{'not-sign':true,'active':simpleNested.isNot}" @click="simpleNested.isNot = !simpleNested.isNot">!</div>
                      </div>
                      <NestedSimple v-if="shouldContentLoad"
                        class="right-pane"
                        pageType="batch"
                        :exp="simpleNested.exp"
                        :refr="simpleNested.refr"
                        :first="true"
                        :isCustomFunction="false"
                        :cfParamsLength="0"
                        :dateConfig="simpleNested.dateConfig"
                        :dataList="dataList"
                        :restApiList = "restApiList"
                        :ruleList="ruleList"
                        :dateAttributeList="dateAttributeList"
                        :customFunctionsList="queryBuilderFunctionsList"
                        :variablesList="queryBuilderVariablesList"
                        :attributesList="queryBuilderAttributesList"
                        :customFunctionApiNameList="rawCustomFunctionApiList"
                        :customFunctionNameList="rawCustomFunctionList"
                        :cusFuncMapping="cusFuncMapping"
                        :controlAttrMapping="controlAttrMapping"
                        :attributesMapping="attributesMapping"
                        :depth="1"
                        :userHydraSegments="userHydraSegments"
                        :hydraTags="hydraTags"
                        :userHydraSegmentsCode="userHydraSegmentsCode"
                        :deviceHydraSegments="deviceHydraSegments"
                        :deviceHydraSegmentsCode="deviceHydraSegmentsCode"
                        :tasks="simpleNested.tasks"
                        :parentTasks="simpleNested.tasks"
                        :parentTaskIndex="0"
                        :cfRuleObj="cfRuleObj"
                        :ruleAttrObj="ruleAttrObj"
                        @changeLog="log"
                        />
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
        </b-row>
          <!-- <ClassificationsFlags v-if="shouldContentLoad" :values="setInfo" /> -->
        <b-row>
        </b-row>
      </b-card>
    </b-col>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
