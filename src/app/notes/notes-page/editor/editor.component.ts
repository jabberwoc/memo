import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, Input, Output,
  ViewChild, ElementRef, Renderer2, NgZone
} from '@angular/core';
import { Note } from '../../../entities/note';
import { Subject } from 'rxjs/Subject';

declare var tinymce: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})

export class EditorComponent implements AfterViewInit, OnDestroy {

  @Output() addNote = new EventEmitter();
  @Output() noteChanged = new EventEmitter();

  @ViewChild('noteTitle')
  private noteTitle: ElementRef;

  @Output() onEditorReady = new EventEmitter<any>();
  @Output() changeNote = new EventEmitter<Note>();

  private selectedNoteValue: Note;
  get selectedNote(): Note {
    return this.selectedNoteValue;
  }
  @Input()
  set selectedNote(value: Note) {
    this.selectedNoteValue = value;
    if (this.selectedNoteValue) {
      this.setContent(this.selectedNoteValue.content);
    }
  }

  elementId = 'editor';
  editor: any;
  editorReady = false;
  titleEditMode = false;
  toolbarVisible = true;
  debouncer: Subject<Note> = new Subject<Note>();

  constructor(private renderer: Renderer2, private ngZone: NgZone) {
    this.debouncer
      .debounceTime(300)
      .subscribe((n) => this.changeNote.emit(n));
  }


  ngAfterViewInit() {

    this.initEditor();
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

  saveNote(): void {
    const debounceNext = () => this.debouncer.next(this.selectedNote);

    if (NgZone.isInAngularZone()) {
      debounceNext();
    } else {
      this.ngZone.run(() =>
        debounceNext());
    }
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

    input.onchange = function (e: any) {
      const file = e.target.files[0];

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
    this.editor = editor;
    editor.on('init', () => this.editorOnInit());
    editor.on('change', () => this.editorOnChange());
    // editor.on('keyup', this.onKeyup);
  }

  setContent(content: string): void {
    if (this.editorReady) {
      if (content !== this.editor.getContent()) {

        this.editor.setContent(content);
        // TODO on note change only
        this.editor.undoManager.clear();
      }
    } else {
      (document.getElementById('editor') as HTMLTextAreaElement).value = content;
    }
  }

  onTitleKeydown(e): void {
    if (e.keyCode === 37 || e.keyCode === 39) { // left / right arrow
      e.stopPropagation();
    } else if (e.keyCode === 13) { // enter
      this.setTitleEditMode(false);

      // TODO set title
      // this.selectedNote.name = ???
      this.saveNote();

    }
  }

  editorOnInit(): void {
    this.addEditorTitle();

    this.editorReady = true;
    this.onEditorReady.next(true);
    this.resizeEditor();
  }

  editorOnChange(): void {
    const content = this.editor.getContent();

    if (content !== this.selectedNote.content) {
      this.selectedNote.content = content;
      // run through zone
      this.ngZone.run(() =>
        this.saveNote());
    }
  }

  addEditorTitle(): void {
    const editorArea = document.getElementsByClassName('mce-edit-area')[0];

    editorArea.parentElement.insertBefore(this.noteTitle.nativeElement, editorArea);

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
  }

  resizeEditor(): void {
    const wrapperHeight = document.getElementById('wrapper').offsetHeight;
    const noteHeaderHeight = document.getElementById('note-title').offsetHeight;

    let toolbarGrpHeight = 0;
    // TODO
    if (this.toolbarVisible) {
      toolbarGrpHeight = document.getElementsByClassName('mce-toolbar-grp')[0].clientHeight;
    }

    const targetHeight = wrapperHeight - toolbarGrpHeight - noteHeaderHeight;

    this.resize(targetHeight);

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

  onAddNote(): void {
    this.addNote.next();
  }
}
