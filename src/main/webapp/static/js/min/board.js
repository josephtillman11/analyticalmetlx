function setupStatus(){pending={};var a=$("#strokesPending"),c=$("#latency"),e=0;window.progressFuncs={};var d={};window.updateStrokesPending=function(d,f){0<d?pending[f]=Date.now():f in pending&&(e=Date.now()-pending[f],delete pending[f]);a.text(Object.keys(pending).length);c.text(e)};window.registerTracker=function(a,c){c?progressFuncs[a]=c:console.log("No tracker provided against",a)};window.updateTracking=function(a){if(a in progressFuncs){var c=progressFuncs[a];delete progressFuncs[a];c()}else console.log("updateTracking problem: Nobody is listening for ",
a)};window.stopTracking=function(a){if(a in d)d[a]();delete progressFuncs[a];delete d[a]};window.trackerFrom=function(a){return _.filter(_.keys(progressFuncs),function(c){return _.endsWith(a,sprintf("_from:%s",c))})}}
function strokeCollected(a){if(0<a.length){for(var c=Conversations.getCurrentSlideJid(),c={thickness:scaleScreenToWorld(Modes.draw.drawingAttributes.width),color:[Modes.draw.drawingAttributes.color,255],type:"ink",author:UserSettings.getUsername(),timestamp:Date.now(),target:"presentationSpace",privacy:Privacy.getCurrentPrivacy(),slide:c.toString(),isHighlighter:Modes.draw.drawingAttributes.isHighlighter},e=[],d,g,f=0;f<a.length;f+=3)d=a[f],g=a[f+1],d=screenToWorld(d,g),e=e.concat([d.x,d.y,a[f+2]]);
c.points=e;c.checksum=c.points.reduce(function(a,c){return a+c},0);c.startingSum=c.checksum;c.identity=c.checksum.toFixed(1);calculateInkBounds(c);prerenderInk(c);c.isHighlighter?boardContent.highlighters[c.identity]=c:boardContent.inks[c.identity]=c;sendInk(c)}}
function batchTransform(){var a=Conversations.getCurrentSlideJid();return{type:"moveDelta",identity:Date.now().toString(),author:UserSettings.getUsername(),slide:a.toString(),target:"presentationSpace",privacy:Privacy.getCurrentPrivacy(),timestamp:Date.now(),inkIds:[],textIds:[],multiWordTextIds:[],videoIds:[],imageIds:[],xOrigin:0,yOrigin:0,xTranslate:0,yTranslate:0,xScale:1,yScale:1,isDeleted:!1,newPrivacy:"not_set"}}
function sendDirtyInk(a){var c=Conversations.getCurrentSlideJid();sendStanza({type:"dirtyInk",identity:a.identity,author:UserSettings.getUsername(),timestamp:Date.now(),slide:c.toString(),target:"presentationSpace",privacy:a.privacy})}function sendInk(a){updateStrokesPending(1,a.identity);sendStanza(a)}
function hexToRgb(a){return"object"==typeof a&&a.alpha?Colors.getColorForColorParts(a.alpha,a.red,a.green,a.blue):"object"==typeof a&&a[0]&&a[1]&&"string"==typeof a[0]&&"number"==typeof a[1]?a:"string"==typeof a?Colors.getColorObjForHex(a):"array"==typeof a?a:Colors.getDefaultColorObj()}
function partToStanza(a){var c=carota.runs.defaultFormatting,e=hexToRgb(a.color||c.color);return{text:a.text,color:e,size:parseFloat(a.size)||parseFloat(c.size),font:a.font||c.font,justify:a.align||c.align,bold:!0===a.bold,underline:!0===a.underline,italic:!0===a.italic}}
function richTextEditorToStanza(a){a.bounds||a.doc.invalidateBounds();var c=a.bounds,e=a.doc.save();void 0==a.slide&&(a.slide=Conversations.getCurrentSlideJid());void 0==a.author&&(a.author=UserSettings.getUsername());void 0==a.target&&(a.target="presentationSpace");void 0==a.privacy&&(a.privacy=Privacy.getCurrentPrivacy());return{author:a.author,timestamp:-1,target:a.target,tag:"_",privacy:a.privacy,slide:a.slide,identity:a.identity,type:a.type,x:c[0],y:c[1],requestedWidth:c[2]-c[0],width:a.doc.width(),
height:c[3]-c[1],words:e.map(partToStanza)}}function sendRichText(a){Modes.text.echoesToDisregard[a.identity]=!0;a=richTextEditorToStanza(a);sendStanza(a)}var stanzaHandlers={ink:inkReceived,dirtyInk:dirtyInkReceived,move:moveReceived,moveDelta:transformReceived,image:imageReceived,video:videoReceived,text:textReceived,multiWordText:richTextReceived,command:commandReceived,submission:submissionReceived,attendance:attendanceReceived,file:fileReceived,theme:themeReceived};
function themeReceived(a){boardContent.themes.push(a);Progress.call("themeReceived")}function fileReceived(a){}function attendanceReceived(a){}function submissionReceived(a){Submissions.processSubmission(a)}
function commandReceived(a){if("/TEACHER_VIEW_MOVED"==a.command&&a.parameters[5]==Conversations.getCurrentSlide().id.toString()){var c=_.slice(a.parameters,0,6).map(parseFloat);if(_.some(c,isNaN))console.log("Can't follow teacher to",a);else if(c[4]!=DeviceConfiguration.getIdentity()&&Conversations.getIsSyncedToTeacher()){console.log("teacherViewMoved",a);var e=function(){var d=a.parameters[6];c[5]==Conversations.getCurrentSlide().id.toString()&&("true"==d?zoomToFit():(zoomToPage(),TweenController.zoomAndPanViewbox(c[0],
c[1],c[2],c[3],function(){},!1,!0)))};UserSettings.getIsInteractive()||e()}}}function richTextReceived(a){a.identity in Modes.text.echoesToDisregard||isUsable(a)&&WorkQueue.enqueue(function(){Modes.text.editorFor(a).doc.load(a.words);blit()})}
function textReceived(a){try{isUsable(a)?(boardContent.texts[a.identity]=a,prerenderText(a),incorporateBoardBounds(a.bounds),WorkQueue.enqueue(function(){return isInClearSpace(a.bounds)?(drawText(a),!1):!0})):a.identity in boardContent.texts&&delete boardContent.texts[a.identity]}catch(c){console.log("textReceived exception:",c)}}function receiveMeTLStanza(a){Progress.call("stanzaReceived",[a])}
function actOnReceivedStanza(a){try{a.type in stanzaHandlers?(stanzaHandlers[a.type](a),Progress.call("onBoardContentChanged")):console.log(sprintf("Unknown stanza: %s %s",a.type,a))}catch(c){console.log("Exception in receiveMeTLStanza",c,a)}}
function transformReceived(a){var c="",e=function(){var a=[void 0,void 0,void 0,void 0],b=function(){return a},c=function(b,c){void 0==b||isNaN(b)||(a[c]=b)};return{minX:b[0],setMinX:function(a){c(a,0)},minY:b[1],setMinY:function(a){c(a,1)},maxX:b[2],setMaxX:function(a){c(a,2)},maxY:b[3],setMaxY:function(a){c(a,3)},incorporateBounds:function(b){var c=function(c){var d=a[c];void 0==d||isNaN(d)?a[c]=b[c]:a[c]=Math.max(d,b[c])},d=function(c){var d=a[c];void 0==d||isNaN(d)?a[c]=b[c]:a[c]=Math.min(d,b[c])};
d(0);d(1);c(2);c(3)},getBounds:b,incorporateBoardBounds:function(){void 0!=a[0]&&void 0!=a[1]&&void 0!=a[2]&&void 0!=a[3]&&incorporateBoardBounds(a)}}}();if("not_set"!=a.newPrivacy&&!a.isDeleted){var d=a.newPrivacy,c=c+("Became "+d);$.each(a.inkIds,function(a,b){var c=boardContent.inks[b];c&&(c.privacy=d);if(c=boardContent.highlighters[b])c.privacy=d});$.each(a.imageIds,function(a,b){boardContent.images[b].privacy=d});$.each(a.videoIds,function(a,b){boardContent.videos[b].privacy=d});$.each(a.textIds,
function(a,b){boardContent.texts[b].privacy=d});$.each(a.multiWordTextIds,function(a,b){boardContent.multiWordTextIds[b].privacy=d})}a.isDeleted&&(c+="deleted",d=a.privacy,$.each(a.inkIds,function(a,b){deleteInk("highlighters",d,b);deleteInk("inks",d,b)}),$.each(a.imageIds,function(a,b){deleteImage(d,b)}),$.each(a.videoIds,function(a,b){deleteVideo(d,b)}),$.each(a.textIds,function(a,b){deleteText(d,b)}),$.each(a.multiWordTextIds,function(a,b){deleteMultiWordText(d,b)}));if(1!=a.xScale||1!=a.yScale){var c=
c+sprintf("scale (%s,%s)",a.xScale,a.yScale),g=[],f=[],h=[],l=[],m=[];$.each(a.inkIds,function(a,b){g.push(boardContent.inks[b]);g.push(boardContent.highlighters[b])});$.each(a.imageIds,function(a,b){l.push(boardContent.images[b])});$.each(a.videoIds,function(a,b){m.push(boardContent.videos[b])});$.each(a.textIds,function(a,b){f.push(boardContent.texts[b])});$.each(a.multiWordTextIds,function(a,b){b in Modes.text.echoesToDisregard||h.push(boardContent.multiWordTexts[b])});var k=0,n=0;if("xOrigin"in
a&&"yOrigin"in a)k=a.xOrigin,n=a.yOrigin;else{var r=!0,p=function(a){r?(k=a.x,n=a.y,r=!1):(a.x<k&&(k=a.x),a.y<n&&(n=a.y))};$.each(g,function(a,b){void 0!=b&&"bounds"in b&&1<_.size(b.bounds)&&p({x:b.bounds[0],y:b.bounds[1]})});$.each(f,function(a,b){void 0!=b&&"x"in b&&"y"in b&&p({x:b.x,y:b.y})});$.each(h,function(a,b){void 0!=b&&"x"in b&&"y"in b&&p({x:b.x,y:b.y})});$.each(l,function(a,b){void 0!=b&&"x"in b&&"y"in b&&p({x:b.x,y:b.y})});$.each(m,function(a,b){void 0!=b&&"x"in b&&"y"in b&&p({x:b.x,y:b.y})})}e.setMinX(k);
e.setMinY(n);$.each(g,function(c,b){if(b&&void 0!=b){var d=b.points,f=b.bounds[0],g=b.bounds[1],h,l,m=f-k;h=g-n;for(var m=-(m-m*a.xScale),p=-(h-h*a.yScale),q=0;q<d.length;q+=3)h=d[q]-f,l=d[q+1]-g,d[q]=f+h*a.xScale+m,d[q+1]=g+l*a.yScale+p;calculateInkBounds(b);e.incorporateBounds(b.bounds)}});$.each(l,function(c,b){if(void 0!=b){b.width*=a.xScale;b.height*=a.yScale;var d=b.x-k,f=b.y-n,f=-(f-f*a.yScale);b.x+=-(d-d*a.xScale);b.y+=f;calculateImageBounds(b);e.incorporateBounds(b.bounds)}});$.each(m,function(c,
b){if(void 0!=b){b.width*=a.xScale;b.height*=a.yScale;var d=b.x-k,f=b.y-n,f=-(f-f*a.yScale);b.x+=-(d-d*a.xScale);b.y+=f;calculateVideoBounds(b);e.incorporateBounds(b.bounds)}});$.each(f,function(c,b){if(void 0!=b){b.width*=a.xScale;b.height*=a.yScale;var d=b.x-k,f=b.y-n,f=-(f-f*a.yScale);b.x+=-(d-d*a.xScale);b.y+=f;b.size*=a.yScale;b.font=sprintf("%spx %s",b.size,b.family);isUsable(b)?(prerenderText(b),calculateTextBounds(b)):b.identity in boardContent.texts&&delete boardContent.texts[b.identity];
e.incorporateBounds(b.bounds)}});$.each(h,function(c,b){if(void 0!=b){b.requestedWidth=(b.width||b.requestedWidth)*a.xScale;b.width=b.requestedWidth;b.doc.width(b.width);_.each(b.words,function(b){b.size*=a.xScale});var d=b.x-k,f=b.y-n;b.doc.position={x:b.x+-(d-d*a.xScale),y:b.y+-(f-f*a.yScale)};b.doc.load(b.words);e.incorporateBounds(b.bounds)}})}if(a.xTranslate||a.yTranslate){var t=a.xTranslate,u=a.yTranslate,c=c+sprintf("translate (%s,%s)",t,u),v=function(a){if(a){for(var b=a.points,c=0;c<b.length;c+=
3)b[c]+=t,b[c+1]+=u;calculateInkBounds(a);e.incorporateBounds(a.bounds)}};$.each(a.inkIds,function(a,b){v(boardContent.inks[b]);v(boardContent.highlighters[b])});$.each(a.videoIds,function(c,b){var d=boardContent.videos[b];console.log("Shifting video",d.x,d.y);d.x+=a.xTranslate;d.y+=a.yTranslate;calculateVideoBounds(d);console.log("Shifting video",d.x,d.y);e.incorporateBounds(d.bounds)});$.each(a.imageIds,function(c,b){var d=boardContent.images[b];console.log("Shifting image",d.x,d.y);d.x+=a.xTranslate;
d.y+=a.yTranslate;calculateImageBounds(d);console.log("Shifting image",d.x,d.y);e.incorporateBounds(d.bounds)});$.each(a.textIds,function(c,b){var d=boardContent.texts[b];d.x+=a.xTranslate;d.y+=a.yTranslate;calculateTextBounds(d);e.incorporateBounds(d.bounds)});$.each(a.multiWordTextIds,function(c,b){if(!(b in Modes.text.echoesToDisregard)){var d=boardContent.multiWordTexts[b],f=d.doc;f.position.x+=a.xTranslate;f.position.y+=a.yTranslate;d.x=f.position.x;d.y=f.position.y;e.incorporateBounds(d.bounds)}})}e.incorporateBoardBounds();
updateStatus(sprintf("%s %s %s %s %s %s",c,a.imageIds.length,a.textIds.length,a.multiWordTextIds.length,a.inkIds.length,a.videoIds.length));_.each(trackerFrom(a.identity),function(a){updateTracking(a)});blit()}
function moveReceived(a){updateStatus(sprintf("Moving %s, %s, %s",Object.keys(a.images).length,Object.keys(a.texts).length,Object.keys(a.inks).length));$.each(a.inks,function(a,e){boardContent.inks[a]=e});$.each(a.images,function(a,e){boardContent.images[a]=e});$.each(a.texts,function(a,e){boardContent.texts[a]=e});$.each(a.multiWordTexts,function(a,e){boardContent.multiWordTexts[a]=e});blit()}
function deleteInk(a,c,e){if(e in boardContent[a]){var d=boardContent[a][e];d.privacy.toUpperCase()==c.toUpperCase()&&(delete boardContent[a][e],Progress.call("onCanvasContentDeleted",[d]))}}function deleteImage(a,c){var e=boardContent.images[c];e.privacy.toUpperCase()==a.toUpperCase()&&(delete boardContent.images[c],Progress.call("onCanvasContentDeleted",[e]))}
function deleteVideo(a,c){var e=boardContent.videos[c];e.privacy.toUpperCase()==a.toUpperCase()&&(delete boardContent.videos[c],Progress.call("onCanvasContentDeleted",[e]))}function deleteText(a,c){var e=boardContent.texts[c];e.privacy.toUpperCase()==a.toUpperCase()&&(delete boardContent.texts[c],Progress.call("onCanvasContentDeleted",[e]))}
function deleteMultiWordText(a,c){var e=boardContent.multiWordTexts[c];e.privacy.toUpperCase()==a.toUpperCase()&&(delete boardContent.multiWordTexts[c],Progress.call("onCanvasContentDeleted",[e]))}function dirtyInkReceived(a){var c=a.identity;a=a.privacy;deleteInk("highlighters",a,c);deleteInk("inks",a,c);updateStatus(sprintf("Deleted ink %s",c));blit()}function isInClearSpace(a){return!_.some(visibleBounds,function(c){return intersectRect(c,a)})}
function screenBounds(a){var c=worldToScreen(a[0],a[1]);a=worldToScreen(a[2],a[3]);return{screenPos:c,screenLimit:a,screenWidth:a.x-c.x,screenHeight:a.y-c.y}}function scaleCanvas(a,c,e,d){return 1<=c&&1<=e?(d=$("<canvas />"),d.width=c,d.height=e,d.attr("width",c),d.attr("height",e),d.css({width:px(c),height:px(e)}),d[0].getContext("2d").drawImage(a,0,0,c,e),d[0]):a}var mipMappingEnabled=!0;
function multiStageRescale(a,c,e,d){if(mipMappingEnabled){d=void 0==d?{}:d;"mipMap"in d||(d.mipMap={});var g=d.mipMap,f=a.width,h=a.height;if(1<=c&&1<=f&&c<f){var f=.5*f,l=.5*h;if(f<c)return a;h=Math.floor(f);h in g||(a=scaleCanvas(a,f,l),g[h]=a);return multiStageRescale(g[h],c,e,d)}}return a}
function drawImage(a,c){var e=void 0==c?boardContext:c;try{if(void 0!=a.canvas){var d=screenBounds(a.bounds);visibleBounds.push(a.bounds);if(1<=d.screenHeight&&1<=d.screenWidth){var g=.1*d.screenWidth,f=.1*d.screenHeight;e.drawImage(multiStageRescale(a.canvas,d.screenWidth,d.screenHeight,a),d.screenPos.x-g/2,d.screenPos.y-f/2,d.screenWidth+g,d.screenHeight+f)}}}catch(h){console.log("drawImage exception",h)}}function drawMultiwordText(a){Modes.text.draw(a)}
function drawText(a,c){var e=void 0==c?boardContext:c;try{var d=screenBounds(a.bounds);visibleBounds.push(a.bounds);1<=d.screenHeight&&1<=d.screenWidth&&e.drawImage(multiStageRescale(a.canvas,d.screenWidth,d.screenHeight,a),d.screenPos.x,d.screenPos.y,d.screenWidth,d.screenHeight)}catch(g){console.log("drawText exception",g)}}
function drawInk(a,c){var e=void 0==c?boardContext:c,d=screenBounds(a.bounds);visibleBounds.push(a.bounds);var g=a.canvas;if(1<=d.screenHeight&&1<=d.screenWidth){var f=multiStageRescale(g,d.screenWidth,d.screenHeight,a);try{var h=a.thickness/2,l=g.width-h,m=g.height-h;console.log("Drawing ink",h,h,l,m,"from",f.width,f.height);e.drawImage(f,h,h,l,m,d.screenPos.x,d.screenPos.y,d.screenWidth,d.screenHeight)}catch(k){console.log("Exception in drawInk",k)}}}
function drawVideo(a,c){var e=void 0==c?boardContext:c,d=screenBounds(a.bounds);visibleBounds.push(a.bounds);1<=d.screenHeight&&1<=d.screenWidth&&e.drawImage(a.video,d.screenPos.x,d.screenPos.y,d.screenWidth,d.screenHeight)}
function videoReceived(a){calculateVideoBounds(a);incorporateBoardBounds(a.bounds);boardContent.videos[a.identity]=a;prerenderVideo(a);WorkQueue.enqueue(function(){if(isInClearSpace(a.bounds)){try{drawVideo(a),Modes.pushCanvasInteractable("videos",videoControlInteractable(a))}catch(c){console.log("drawVideo exception",c)}return!1}console.log("Rerendering video in contested space");return!0})}
function imageReceived(a){var c=new Image;a.imageData=c;c.onload=function(){0==a.width&&(a.width=c.naturalWidth);0==a.height&&(a.height=c.naturalHeight);a.bounds=[a.x,a.y,a.x+a.width,a.y+a.height];incorporateBoardBounds(a.bounds);boardContent.images[a.identity]=a;updateTracking(a.identity);prerenderImage(a);WorkQueue.enqueue(function(){if(isInClearSpace(a.bounds)){try{drawImage(a)}catch(c){console.log("drawImage exception",c)}return!1}console.log("Rerendering image in contested space");return!0})};
c.src=calculateImageSource(a)}function inkReceived(a){calculateInkBounds(a);updateStrokesPending(-1,a.identity);prerenderInk(a)&&(incorporateBoardBounds(a.bounds),a.isHighlighter?boardContent.highlighters[a.identity]=a:boardContent.inks[a.identity]=a,WorkQueue.enqueue(function(){return isInClearSpace(a.bounds)?(drawInk(a),!1):!0}))}function takeControlOfViewbox(){delete Progress.onBoardContentChanged.autoZooming;UserSettings.setUserPref("followingTeacherViewbox",!0)}
function zoomToFit(a){Progress.onBoardContentChanged.autoZooming=zoomToFit;requestedViewboxWidth=boardContent.width;requestedViewboxHeight=boardContent.height;IncludeView.specific(boardContent.minX,boardContent.minY,boardContent.width,boardContent.height,a)}function zoomToOriginal(a){takeControlOfViewbox();requestedViewboxWidth=boardWidth;requestedViewboxHeight=boardHeight;IncludeView.specific(0,0,boardWidth,boardHeight,a)}
function zoomToPage(a){takeControlOfViewbox();var c=requestedViewboxHeight,e=requestedViewboxWidth;requestedViewboxWidth=boardWidth;requestedViewboxHeight=boardHeight;IncludeView.specific(viewboxX+(e-requestedViewboxWidth)/2,viewboxY+(c-requestedViewboxHeight)/2,boardWidth,boardHeight,a)}function receiveS2C(a,c){try{$(unescape(c)).addClass("s2cMessage").appendTo("body")}catch(e){console.log("receiveS2C exception:",e)}};
