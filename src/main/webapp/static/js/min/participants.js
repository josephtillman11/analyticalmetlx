var Participants=function(){var h={},p={},g={},m={inks:0,highlighters:0,texts:{},images:0,quizResponses:0,submissions:0,following:!0},q=function(c){return _.reduce(c.words,function(a,d,b){return a+d.text.length},0)},r=d3.scaleLinear().range([9,30]),n,v=function(c){n||(n=d3.select("#lang").style("margin-left","1em"));r.domain(d3.extent(_.map(c,"value")));c=n.selectAll(".word").data(c,function(a){return a.key});c.enter().append("div").attr("class","word").style("margin-right","1em").style("display",
"inline-block").style("vertical-align","middle").text(function(a){return a.key}).style("font-size",function(a){return r(a.value)+"px"}).merge(c).sort(function(a,d){return d3.ascending(d.value,a.value)});c.exit().remove()},l={keyboarding:!0,handwriting:!0,imageRecognition:!0,imageTranscription:!0},k=function(){h.jsGrid("loadData");var c=h.jsGrid("getSorting");"field"in c&&h.jsGrid("sort",c);Analytics.word.reset();var a={};_.each(boardContent.themes,function(d){_.each(d.text.split(" "),function(b){b=
b.toLowerCase();var e=d.origin;1==l[e]&&(Analytics.word.incorporate(b),b in a||(a[b]={}),e in a[b]||(a[b][e]=0),a[b][e]++)})});v(Analytics.word.cloudData())},x=function(){showBackstage("participants");updateActiveMenu(this);w();k()},t=function(){Conversations.shouldModifyConversation()?($("#menuParticipants").off().on("click",x),$("#menuParticipants").show()):($("#menuParticipants").unbind("click"),$("#menuParticipants").hide())},u=function(){t()},w=function(){_.each(l,function(c,a){$(sprintf("#%s",
a)).click(function(){l[a]=!l[a];k()})})};$(function(){t();h=$("#participantsDatagrid");p=h.find(".followControls").clone();h.empty();var c=function(a){jsGrid.Field.call(this,a)};c.prototype=new jsGrid.Field({sorter:function(a,d){return new Date(a)-new Date(d)},itemTemplate:function(a){return(new Date(a)).toLocaleString()},insertTemplate:function(a){return""},editTemplate:function(a){return""},insertValue:function(){return""},editValue:function(){return""}});jsGrid.fields.dateField=c;h.jsGrid({width:"100%",
height:"auto",inserting:!1,editing:!1,sorting:!0,paging:!0,noDataContent:"No participants",controller:{loadData:function(a){var d=_.map(_.keys(g),function(a){var e=g[a];return{name:a,following:e.following,attendances:_.size(e.attendances),images:e.images,inks:e.inks,texts:_.reduce(e.texts,function(a,b){return a+b},0),quizResponses:e.quizResponses,submissions:e.submissions,highlighters:e.highlighters}});"sortField"in a&&(d=_.sortBy(d,function(b){return b[a.sortField]}),"sortOrder"in a&&"desc"==a.sortOrder&&
(d=_.reverse(d)));return d}},pageLoading:!1,fields:[{name:"name",type:"text",title:"Follow",readOnly:!0,sorting:!0,itemTemplate:function(a,d){var b=p.clone(),e=sprintf("participant_%s",d.name);b.find(".followValue").attr("id",e).prop("checked",d.following).on("change",function(){g[d.name].following=$(this).is(":checked");blit();k()});b.find(".followLabel").attr("for",e).text(d.name);return b}},{name:"attendances",type:"number",title:"Attendances",readOnly:!0},{name:"images",type:"number",title:"Images",
readOnly:!0},{name:"inks",type:"number",title:"Inks",readOnly:!0},{name:"highlighters",type:"number",title:"Highlighters",readOnly:!0},{name:"texts",type:"number",title:"Texts",readOnly:!0},{name:"quizResponses",type:"number",title:"Poll responses",readOnly:!0},{name:"submissions",type:"number",title:"Submissions",readOnly:!0}]});h.jsGrid("sort",{field:"name",order:"desc"});k()});Progress.stanzaReceived.participants=function(c){var a=!1;if("type"in c&&"author"in c){var d=c.author;if(!(d in g)){var b=
_.clone(m);b.name=d;g[d]=b}b=g[d];switch(c.type){case "ink":b.inks+=1;a=!0;break;case "image":b.images+=1;a=!0;break;case "highlighter":b.highlighters+=1;a=!0;break;case "multiWordText":b.texts[c.identity]=q(c);a=!0;break;case "submission":b.submissions+=1;a=!0;break;case "quizResponse":b.quizResponses+=1,a=!0}g[d]=b}a&&k()};Progress.themeReceived.participants=function(){"participants"==window.currentBackstage&&k()};Progress.historyReceived.participants=function(c){var a={};Analytics.word.reset();
var d=function(b){return a[b]||_.cloneDeep(m)};_.each(_.groupBy(c.attendances,"author"),function(b){var e=b[0].author,c=d(m);c.name=e;c.attendances=b;a[e]=c});_.each(_.groupBy(c.inks,"author"),function(b,c){var f=d(c);f.inks+=_.size(b);a[c]=f});_.each(_.groupBy(c.highlighters,"author"),function(b,c){var f=d(c);f.highlighters+=_.size(b);a[c]=f});_.each(_.groupBy(c.images,"author"),function(b,c){var f=d(c);f.images+=_.size(b);a[c]=f});_.each(_.groupBy(c.multiWordTexts,"author"),function(b,c){d(c);_.each(b,
function(b){var d=q(b);a[c].texts[b.identity]=d})});_.each(_.groupBy(c.quizResponses,"author"),function(b,c){var f=d(c);f.quizResponses+=_.size(b);a[c]=f});g=a;k()};Progress.conversationDetailsReceived.participants=u;Progress.newConversationDetailsReceived.participants=u;return{getParticipants:function(){return Conversations.shouldModifyConversation()?g:{}},reRender:function(){k()},code:function(c){return _.keys(g).indexOf(c)}}}();
