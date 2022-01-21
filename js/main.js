fetch('./js/content.json')
  .then(response => response.json())
  .then(data => {
      content = data;
      LoadHtmlBlocks();
  })
  .catch(error => console.log(error));

let content = {};
let dropAreas;
let textEditor = document.getElementById("text-editor");

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

function AddNewLine(e, id){
  if(e.key === "Enter"){
    preventDefaults(e);
    let block = document.getElementById(`block-content-${id}`);
    block.innerHTML += "<br />";
  }
}


function LoadHtmlBlocks(){
    textEditor.innerHTML = "";
    if(localStorage["textEditorContentBlocks"] != undefined) content.blocks = JSON.parse(localStorage["textEditorContentBlocks"]);
    content.blocks = content.blocks.filter(element => element !== undefined);

    for(let i = 0; i < content.blocks.length; i++){
        if(content.blocks[i] != undefined) InterpretHtmlBlock(content.blocks[i], i);
    }

    LoadDragDropAreas();
}

function LoadDragDropAreas(){
  dropAreas = Array.from(document.getElementsByClassName('dragdrop-uploader'));

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropAreas.forEach(dropArea => dropArea.addEventListener(eventName, preventDefaults, false));
  });
}

function highlight(dropArea) {
  dropArea.classList.add('highlight')
}

function unhighlight(dropArea) {
  dropArea.classList.remove('highlight')
}

function handleDrop(e, imageId, dropArea){
  let dt = e.dataTransfer;
  UploadNewImage(dt, imageId);
  unhighlight(dropArea);
}

function UploadNewImage(newImage, imageId){
  let imageElement = document.getElementById(imageId);
  let temppath = URL.createObjectURL(newImage.files[0]);
  imageElement.src = temppath;
}

function ToolbarActionItems(id, arrPosition){
  return `
  <span class="text-editor-toolbar" contenteditable="false">
    <button id="btn-up-${id}" type="button" class="btn btn-primary toolbar-item ${arrPosition == 0 ? 'disabled': ''}" onclick="MoveUp('${id}')">↑</button>
    <button id="btn-down-${id}" type="button" class="btn btn-primary toolbar-item ${arrPosition == content.blocks.length-1? 'disabled': ''}" onclick="MoveDown('${id}')">↓</button>
    <button type="button" class="btn btn-danger toolbar-item" onclick="DeleteBlock('${id}')">X</button>
  </span>
  `
}

function ToolbarEditorItems(id){
  return `
  <span class="text-editor-options" contenteditable="false">
    <button class="btn btn-secondary toolbar-item" type="button" onclick="formatDoc('bold');">B</i></button>
    <button class="btn btn-secondary toolbar-item" type="button" onclick="formatDoc('italic');">I</i></button>
    <button class="btn btn-secondary toolbar-item" type="button" onclick="formatDoc('underline');">U</i></button>
    <button class="btn btn-secondary toolbar-item" type="button" onclick="AlignBlock('${id}', 'left');"><i class="fa fa-align-left" aria-hidden="true"></i></button>
    <button class="btn btn-secondary toolbar-item" type="button" onclick="AlignBlock('${id}', 'center');"><i class="fa fa-align-center" aria-hidden="true"></i></button>
    <button class="btn btn-secondary toolbar-item" type="button" onclick="AlignBlock('${id}', 'right');"><i class="fa fa-align-right" aria-hidden="true"></i></button>
    <button class="btn btn-secondary toolbar-item" type="button" onclick="formatDoc('removeFormat');">Format</i></button>
    <button id="switchBox" class="btn btn-secondary toolbar-item" type="button" onclick="setDocMode(this);">HTML</i></button>
  </span>
  `
}

function ToolbarAddNewItems(id){
  return `
  <span class="text-editor-addnew" contenteditable="false">
    <button type="button" class="btn btn-outline-primary toolbar-item" onclick="DisplayNewLineOptions(this)">+</button>
    <span class="text-editor-addnew-toolbar">
      <button type="button" class="btn btn-outline-primary toolbar-item" onclick="AddNewRow('${id}', 'p')">p</button>
      <button type="button" class="btn btn-outline-primary toolbar-item" onclick="AddNewRow('${id}', 'ul')">ul</button>
      <button type="button" class="btn btn-outline-primary toolbar-item" onclick="AddNewRow('${id}', 'blockquote')">quote</button>
      <button type="button" class="btn btn-outline-primary toolbar-item" onclick="AddNewRow('${id}', 'details')">details</button>
      <button type="button" class="btn btn-outline-primary toolbar-item" onclick="AddNewRow('${id}', 'hr')">hr</button>
      <select class="btn btn-outline-primary toolbar-item" onchange="AddNewRow('${id}', this.selectedOptions[0].innerText)" >
        <option value="">Seleccionar...</option>
        <option value="h2">h2</option>
        <option value="h3">h3</option>
        <option value="h4">h4</option>
      </select>
    </span>    
  </span>
  `
}

function AddToolbarItems(id, arrPosition){
  return `
  ${ToolbarActionItems(id, arrPosition)}
  ${ToolbarEditorItems(id)}
  ${ToolbarAddNewItems(id)}
  `;
}

function ChangeAddNewButtonContent(button){
  if(button.innerText == "+"){
    button.innerText = "-";
    button.classList.remove("btn-outline-primary");
    button.classList.add("btn-secondary")
  }
  else{
    button.innerText = "+";
    button.classList.add("btn-outline-primary");
    button.classList.remove("btn-secondary")
  }
}

function DisplayNewLineOptions(button){
  ChangeAddNewButtonContent(button);
  button.nextElementSibling.classList.toggle("active");
}


function InterpretHtmlBlock(block, arrPosition){
    switch(block.type)
    {
      case "heading":
          textEditor.innerHTML += 
          `<h${block.data.type} id="${block.id}" contenteditable="true" class="${block.class}" onfocusout="SaveContentData('${block.id}')" style="${block.data.extraCss}"  onkeydown="AddNewLine(event, '${block.id}')">
          ${AddToolbarItems(block.id, arrPosition)}
          <span id="block-content-${block.id}" >${block.data.content}</span>
          </h${block.data.type}>`;
          break;
      case "details":
          textEditor.innerHTML += 
          `<details id="${block.id}" class="${block.class}" contenteditable="true" onfocusout="SaveContentData('${block.id}')" style="${block.data.extraCss}">
          ${AddToolbarItems(block.id, arrPosition)}
              <summary id="block-summary-${block.id}">${block.data.summary}</summary>
              <p id="block-content-${block.id}"  onkeydown="AddNewLine(event, '${block.id}')">${block.data.content}</p>
            </details>`;
          break;
      case "hr":
        textEditor.innerHTML += 
        `<span id="${block.id}" class="${block.class}" >
          <hr contenteditable="true" />
          ${ToolbarActionItems(block.id, arrPosition)}
        </span>`
        break;
      case "paragraph":
          textEditor.innerHTML += 
          `<p id="${block.id}" class="${block.class}" contenteditable="true" onfocusout="SaveContentData('${block.id}')" style="${block.data.extraCss}" onkeydown="AddNewLine(event, '${block.id}')">
          ${AddToolbarItems(block.id, arrPosition)}
            <span id="block-content-${block.id}">${block.data.content}</span>
          </p>`;
          break;
      case "blockquote":
        textEditor.innerHTML += 
        `<blockquote id="${block.id}" class="${block.class}" contenteditable="true" onfocusout="SaveContentData('${block.id}')" style="${block.data.extraCss}" onkeydown="AddNewLine(event, '${block.id}')">
        ${AddToolbarItems(block.id, arrPosition)}
          <span id="block-content-${block.id}" >${block.data.content}</span>
        </blockquote>`;
        break;
      case "figure":
          textEditor.innerHTML += 
          `<figure id="${block.id}" class="${block.class}" contenteditable="true" style="${block.data.extraCss}" onfocusout="SaveContentData('${block.id}')">
              ${AddToolbarItems(block.id, arrPosition)}
              <div style="position:relative; height: 100%;">
              <span id="upload-image-${block.id}" class="dragdrop-uploader" ondragenter="highlight(this)" ondragover="highlight(this)" ondragleave="unhighlight(this)" ondrop="handleDrop(event, 'block-image-${block.id}', this)">
                <input id="input-image-${block.id}" type="file" accept="image/*" value="${block.data.file.url}" onchange="UploadNewImage(this, 'block-image-${block.id}')" hidden />
                <label>UPLOAD OR DROP AN IMAGE</label>
              </span>
              <img id="block-image-${block.id}" src="${block.data.file.url}" alt="${block.data.file.altText}" class="${block.data.imageClass}">
              </div>
              <figcaption id="block-caption-${block.id}" >${block.data.caption}</figcaption>
          </figure>`;
          break;
      case "unordered-list":
        textEditor.innerHTML += 
        `<ul id="${block.id}" class="${block.class}" onfocusout="SaveContentData('${block.id}')" contenteditable="true" style="${block.data.extraCss}">
            ${AddToolbarItems(block.id, arrPosition)}
            <span id="block-content-${block.id}">
            ${block.data.content}
            </span>
        </ul>`;
        break;
      default:
          break;
    }
}

function GetBlockById(id){
  return content.blocks.filter(element => element !== undefined).find(block => block.id == id)
}

function GetArrayPositionById(id){
  content.blocks = content.blocks.filter(element => element !== undefined);

  for(let i = 0; i < content.blocks.length; i++){
      if(content.blocks[i].id == id) return i;
  }
}

function SaveContentData(id){
  let blockContent = document.getElementById(`block-content-${id}`);
  let blockSummary = document.getElementById(`block-summary-${id}`);
  let blockCaption = document.getElementById(`block-caption-${id}`);
  content.blocks.find(block => {
    if(block.id == id){
      if(blockContent != null) block.data.content = blockContent.innerHTML;
      if(blockSummary != null) block.data.summary = blockSummary.innerHTML;
      if(blockCaption != null) block.data.caption = blockCaption.innerHTML;
    }
  })

  TemporarySave();
}


function TemporarySave(){
  localStorage["textEditorContentBlocks"] = JSON.stringify(content.blocks.filter(element => element !== undefined));
}

function DeleteBlock(blockId){
  let position = GetArrayPositionById(blockId);
  delete content.blocks[position];

  TemporarySave();
  LoadHtmlBlocks();
}

function AddNewRow(id, blockType){
  let currentBlockPosition = GetArrayPositionById(id);
  let beforeItems = content.blocks.slice(0, currentBlockPosition+1);
  let afterItems = content.blocks.slice(currentBlockPosition+1);
  let blockId = uuidv4().replaceAll('-', '');
  let newBlock = {
    "id": `${blockId}`,
    "type" : '',
    "class": "editor-item",
    "data": {}
  }

  switch(blockType){
    case 'h2':
      newBlock.type = 'heading';
      newBlock.data = {
          "type": "2",
          "content": "Hello there!",
          "extraCss": ""
      };
      break;
    case 'h3':
      newBlock.type = 'heading';
      newBlock.data = {
          "type": "3",
          "content": "Hello there!",
          "extraCss": ""
      };
      break;
    case 'h4':
      newBlock.type = 'heading';
      newBlock.data = {
          "type": "4",
          "content": "Hello there!",
          "extraCss": ""
      };     
      break;
    case 'p':
      newBlock.type = 'paragraph';
      newBlock.data = {
          "content": "Dummy text :)",
          "extraCss": "",
      };
      break;
    case 'details':
      newBlock.type = 'details';
      newBlock.data = {
          "content": "Dummy text :)",
          "summary": "summary title",
          "extraCss": "",
      };
      break;
    case 'blockquote':
      newBlock.type = 'blockquote';
      newBlock.data = {
          "content": "Hello! I'm a quote :)",
          "extraCss": "",
      };
      break;
    case 'ul':
      newBlock.type = 'unordered-list';
      newBlock.data = {
          "content": "<li>Item 1</li>",
          "extraCss": "",
      };
      break;
    case 'hr':
      newBlock.type = 'hr';
      break;
    case 'figure':
      newBlock.type = 'figure';
      newBlock.data = {
        "file" : {
              "url" : "https://cdn.pixabay.com/photo/2021/10/07/15/12/wine-6688901_960_720.jpg",
              "altText": "Imagen de un vino"
          },
          "caption" : "Esto es una imagen de un vino",
          "imageClass": "img-fluid",
          "extraCss": ""
      };
      break;
  }
  
  let newBlocks = [...beforeItems, newBlock].concat(afterItems);
  content.blocks = newBlocks;
  TemporarySave();
  LoadHtmlBlocks();
}

function MoveUp(idActual){
  let button = document.getElementById(`btn-up-${idActual}`);
  let intermediaryBlock;
  let position;

  for(let i = 0; i < content.blocks.length; i++){
    if(content.blocks[i] == undefined) continue;
    if(content.blocks[i].id == idActual) {
      intermediaryBlock = content.blocks[i];
      position = i;
    }
  }

  if(position == 1){
    button.classList.add("disabled")
  }
  else{
    button.classList.remove("disabled")
  }

  content.blocks[position] = content.blocks[position-1];
  content.blocks[position-1] = intermediaryBlock;  

  TemporarySave();
  LoadHtmlBlocks();
}

function MoveDown(idActual){
  let button = document.getElementById(`btn-down-${idActual}`);
  let intermediaryBlock;
  let position;

  for(let i = 0; i < content.blocks.length; i++){
    if(content.blocks[i] == undefined) continue;
    if(content.blocks[i].id == idActual) {
      intermediaryBlock = content.blocks[i];
      position = i;
    }
  }

  if(position == content.blocks.length){
    button.classList.add("disabled")
  }
  else{
    button.classList.remove("disabled")
  }

  content.blocks[position] = content.blocks[position+1];
  content.blocks[position+1] = intermediaryBlock;  

  TemporarySave();
  LoadHtmlBlocks();
}

/* TOOLBAR */

function formatDoc(sCmd, sValue){
  document.execCommand(sCmd, false, sValue); 
} 

function AlignBlock(blockId, alignType){
  let block = GetBlockById(blockId);

  switch(alignType){
    case 'left':
      block.data.extraCss = "text-align: left;";
      break;
    case 'center':
      block.data.extraCss = "text-align: center;";
      break;
    case 'right':
      block.data.extraCss = "text-align: right;";
      break;
    default:
      break;
  }

  TemporarySave();
  LoadHtmlBlocks();
}

let showHtml = false;

function setDocMode(element) {
  let blockItem, blockInnerHTML, preHtmlObject;
  blockItem = document.getElementById(`block-content-${element.parentNode.parentNode.id}`);
  showHtml = !showHtml;
  
  if (showHtml) 
  {
    blockInnerHTML = document.createTextNode(blockItem.innerHTML);
    blockItem.innerHTML = "";
    preHtmlObject = document.createElement("pre");
    blockItem.contentEditable = false;
    preHtmlObject.id = "sourceText";
    preHtmlObject.contentEditable = true;
    preHtmlObject.appendChild(blockInnerHTML);
    blockItem.appendChild(preHtmlObject);
    document.execCommand("defaultParagraphSeparator", false, "div");
  } 
  else 
  {
    blockInnerHTML = document.createRange();
    blockInnerHTML.selectNodeContents(blockItem.firstChild);
    blockItem.innerHTML = blockInnerHTML.toString();
    blockItem.contentEditable = true;
  }

  blockItem.focus();
}