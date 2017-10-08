import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, Input, Output, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Note } from '../../../entities/note';

declare var tinymce: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})

export class EditorComponent implements AfterViewInit, OnDestroy {


  @ViewChild('noteTitle')
  private noteTitle: ElementRef;

  // @Input() elementId: string;
  // @Input() title = 'hans';
  elementId = 'editor';
  @Input() content: string;
  @Output() onEditorReady = new EventEmitter<any>();

  @Input() selectedNote: Note;

  editor: any;
  editorReady = false;
  titleEditMode = false;

  constructor(private renderer: Renderer2) { }


  ngAfterViewInit() {

    this.initEditor();
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }


  initEditor(): void {
    // TODO
    tinymce.baseURL = 'assets/tinymce/';
    tinymce.init({
      selector: '#' + this.elementId,

      // skin_url: 'assets/tinymce/skins/modern',
      content_css: 'assets/styles/editor.css',

      // setup: editor => {
      //   this.editor = editor;
      //   editor.on('keyup', () => {
      //     const content = editor.getContent();
      //     this.onEditorKeyup.emit(content);
      //   });
      // },

      // TODO
      // content_css: contentCss,

      statusbar: false,
      branding: false,
      menubar: false,
      resize: false,

      plugins: [
        'advlist autolink lists link image charmap print hr anchor pagebreak',
        'searchreplace wordcount visualblocks visualchars fullscreen',
        'insertdatetime nonbreaking save table contextmenu',
        'paste textcolor colorpicker textpattern imagetools codesample code noneditable'
      ],
      toolbar: 'undo redo | styleselect | forecolor backcolor | fontselect | fontsizeselect | '
      + 'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | '
      + 'todoList bullist numlist outdent indent | link image print | codesample | '
      + 'fullscreen code',
      image_advtab: true,
      image_title: true,
      link_context_toolbar: true,
      // enable automatic uploads of images represented by blob or data URIs
      automatic_uploads: true,
      file_picker_types: 'image',
      file_picker_callback: this.filePickerCallback,
      setup: (ed) => this.setup(ed),
      custom_shortcuts: false
    });
  }


  // TODO
  filePickerCallback(cb, value, meta): void {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    // Note: In modern browsers input[type="file"] is functional without
    // even adding it to the DOM, but that might not be the case in some older
    // or quirky browsers like IE, so you might want to add it to the DOM
    // just in case, and visually hide it. And do not forget do remove it
    // once you do not need it anymore.

    input.onchange = function (e) {
      // TODO
      // const file = e.target.files[0];
      const file = null;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        // Note: Now we need to register the blob in TinyMCEs image blob
        // registry. In the next release this part hopefully won't be
        // necessary, as we are looking to handle it internally.
        const id = 'blobid' + (new Date()).getTime();
        const blobCache = tinymce.activeEditor.editorUpload.blobCache;
        const base64 = reader.result.split(',')[1];
        const blobInfo = blobCache.create(id, file, base64);
        blobCache.add(blobInfo);

        // call the callback and populate the Title field with the file name
        cb(blobInfo.blobUri(), { title: file.name });
      };
    };

    input.click();

  }

  resize(height): void {
    if (this.editorReady) {
      // if (this.editor) {
      this.editor.theme.resizeTo('100%', height);
      // }
    }
  }

  setup(editor): void {

    editor.on('init', () => this.editorOnInit());
    // editor.on('keyup', this.onKeyup);
  }

  onTitleKeydown(e): void {
    if (e.keyCode === 37 || e.keyCode === 39) { // left/right arrow
      e.stopPropagation();
    }
    else if (e.keyCode === 13) { // enter
      this.setTitleEditMode(false);
    }
  }

  editorOnInit(): void {
    this.addEditorTitle();

    this.editorReady = true;
    this.onEditorReady.emit(true);
  }

  addEditorTitle(): void {
    // const editorArea = $('.mce-edit-area');
    const editorArea = document.getElementsByClassName('mce-edit-area')[0];
    // const header = this.renderer.createElement('div');
    // header.setAttribute('id', 'note-header');

    editorArea.parentElement.insertBefore(this.noteTitle.nativeElement, editorArea);

    // this.renderer.appendChild(editorArea, header);
    // const header = $('<div/>')
    //   .attr('id', 'note-header');
    // const title = $('<h1/>')
    //   .addClass('note-title')
    //   .attr('data-mce-tabstop', 'true')
    //   .appendTo(header)

    // title.keypress(function (e) {
    //   if (e.which == 13) { // enter
    //     $(e.target).blur()
    //     e.preventDefault()
    //   }
    // })
  }


  setTitleEditMode(isEditable: boolean): void {
    // const title = this.noteTitle.nativeElement.firstElementChild;
    this.titleEditMode = isEditable;

    if (this.titleEditMode) {
      setTimeout(() => {
        this.noteTitle.nativeElement.firstElementChild.focus();
      }, 0);
    }

    // title.unfocus();
    // title.setAttribute('contenteditable', !title.getAttribute('contenteditable'));
    // console.log('note title editable: ' + title.getAttribute('contenteditable'));
  }

  resizeEditor(): void {
    // // wrapper height
    // const wrapperHeight = $('#wrapper').height()
    // const noteHeaderHeight = $('#note-header').height()
    // let toolbarGrpHeight = 0
    // if ($('.mce-toolbar-grp').is(":visible")) {
    //   toolbarGrpHeight = $('.mce-toolbar-grp').outerHeight()
    // }

    // // extra 9 is for margin added between the toolbars
    // const targetHeight = wrapperHeight - toolbarGrpHeight - noteHeaderHeight

    // this.editor.resize(targetHeight);
  }
}
