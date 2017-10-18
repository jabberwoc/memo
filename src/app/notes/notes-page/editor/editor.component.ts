import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, Input, Output,
  ViewChild, ElementRef, Renderer2, NgZone, HostListener
} from '@angular/core';
import { Note } from '../../../entities/note';
import { Subject } from 'rxjs/Subject';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';

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
    if (_.isEqual(value, this.selectedNoteValue)) {
      return;
    }

    this.selectedNoteValue = value;
    if (this.selectedNoteValue) {
      this.setContent(this.selectedNoteValue.content);

      this.titleForm.setValue({
        title: this.selectedNote.name
      });
    }
  }

  elementId = 'editor';
  editor: any;
  editorReady = false;
  titleEditMode = false;
  toolbarVisible = true;
  debouncer: Subject<Note> = new Subject<Note>();
  titleForm: FormGroup;
  // titleEditForm: FormControl = new FormControl('name', [Validators.required]);
  // get name(): FormControl { return this.titleEditForm; }

  constructor(private renderer: Renderer2, private ngZone: NgZone, private fb: FormBuilder) {
    this.createTitleForm();
    this.debouncer
      .debounceTime(300)
      .subscribe((n) => this.changeNote.emit(n));
  }

  createTitleForm() {
    this.titleForm = this.fb.group({ // <-- the parent FormGroup
      title: ['', Validators.required]
    });
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
      // if (content !== this.editor.getContent()) {

        this.editor.setContent(content);
        // TODO on note change only
        this.editor.undoManager.clear();
      // }
    } else {
      // (document.getElementById('editor') as HTMLTextAreaElement).value = content;
    }
  }

  onTitleEditComplete() {
    this.setTitleEditMode(false);
    const titleValue = this.titleForm.value.title;

    if (this.titleForm.status === 'VALID') {
      if (titleValue !== this.selectedNote.name) {
        this.selectedNote.name = titleValue;
        this.saveNote();
      }
    } else {
      // reset title
      this.titleForm.setValue({
        title: this.selectedNote.name
      });
    }
  }

  editorOnInit(): void {
    this.addEditorTitle();

    setTimeout(() => {
      this.editorReady = true;
      this.resizeEditor();
      this.onEditorReady.next(true);
    }, 0);
  }

  editorOnChange(): void {
    const content = this.editor.getContent();

    if (content !== this.selectedNote.content) {
      this.selectedNote.content = content;

      this.saveNote();
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
    this.titleEditMode = isEditable;

    if (this.titleEditMode) {

      // focus
      setTimeout(() => {
        this.noteTitle.nativeElement.getElementsByTagName('input')[0].focus();
      }, 0);
    }
  }

  @HostListener('window:resize', ['$event'])
  resizeEditor(): void {
    const wrapperHeight = document.getElementById('wrapper').offsetHeight;
    const noteHeaderHeight = document.getElementById('note-title').offsetHeight;

    let toolbarGrpHeight = 0;
    // TODO
    if (this.toolbarVisible) {
      const elements = document.getElementsByClassName('mce-toolbar-grp');
      if (elements) {
        toolbarGrpHeight = elements[0].clientHeight;
      }
    }

    const targetHeight = wrapperHeight - toolbarGrpHeight - noteHeaderHeight;

    this.resize(targetHeight);
  }

  onAddNote(): void {
    this.addNote.next();
  }
}
