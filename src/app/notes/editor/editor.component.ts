import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  Renderer2,
  NgZone,
  HostListener
} from '@angular/core';
import { Note } from '../../core/data/entities/note';
import { Subject } from 'rxjs/Subject';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import * as lodash from 'lodash';
import { LoadingState } from '../notes-page.component';
import { readyAnimation } from '../animations';

declare var tinymce: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  animations: [readyAnimation]
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @Output() addNote = new EventEmitter();
  @Output() changeNote = new EventEmitter<Note>();

  @ViewChild('noteTitle') private noteTitle: ElementRef;

  private selectedNoteValue: Note;
  @Input() saveState: LoadingState;
  get selectedNote(): Note {
    return this.selectedNoteValue;
  }
  @Input()
  set selectedNote(value: Note) {
    if (lodash.isEqual(value, this.selectedNoteValue)) {
      return;
    }

    this.selectedNoteValue = value;
    if (this.selectedNoteValue) {
      this.setContent(this.selectedNoteValue.content);

      this.titleForm.setValue({
        title: this.selectedNote.name
      });

      this.resizeEditor();
    }
  }

  elementId = 'editor';
  editor: any;
  editorReady = false;
  titleEditMode = false;
  titleElementHeight = 0;
  toolbarVisible = false;
  debouncer: Subject<Note> = new Subject<Note>();
  titleForm: FormGroup;

  constructor(private renderer: Renderer2, private ngZone: NgZone, private fb: FormBuilder) {
    this.createTitleForm();
    this.debouncer.debounceTime(300).subscribe(n => this.changeNote.next(n));
  }

  createTitleForm() {
    this.titleForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    this.initEditor();
  }

  ngOnDestroy() {
    if (this.editorReady) {
      this.editor.setContent('');
      tinymce.remove(this.editor);
    }
  }

  zone(fn: (...args: any[]) => void, applyThis?: any, applyArgs?: any[]): void {
    if (NgZone.isInAngularZone()) {
      fn();
    } else {
      this.ngZone.run(fn);
    }
  }

  saveNote(): void {
    // const debounceNext = () => this.debouncer.next(this.selectedNote);

    // if (NgZone.isInAngularZone()) {
    //   debounceNext();
    // } else {
    //   this.ngZone.run(() => debounceNext());
    // }
    this.zone(() => this.debouncer.next(this.selectedNote));
  }

  initEditor(): void {
    // TODO
    tinymce.baseURL = '/assets/tinymce/';
    tinymce.init({
      selector: '#' + this.elementId,

      // skin_url: 'assets/tinymce/skins/modern',
      content_css: '/assets/styles/editor.css',

      statusbar: false,
      branding: false,
      menubar: false,
      resize: false,

      plugins: [
        'advlist autolink lists link image charmap print hr anchor pagebreak',
        'searchreplace wordcount visualblocks visualchars fullscreen',
        'insertdatetime nonbreaking save contextmenu',
        'paste textcolor colorpicker textpattern imagetools codesample code noneditable table'
      ],
      toolbar:
        'undo redo | styleselect | forecolor backcolor | fontselect | fontsizeselect | ' +
        'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | link image print | table codesample | ' +
        'fullscreen code',
      image_advtab: true,
      image_title: true,
      link_context_toolbar: true,
      // enable automatic uploads of images represented by blob or data URIs
      automatic_uploads: true,
      file_picker_types: 'image',
      file_picker_callback: this.filePickerCallback,
      setup: ed => this.setupEditor(ed),
      custom_shortcuts: false
    });
  }

  // TODO
  filePickerCallback(cb, value, meta): void {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    input.onchange = function(e: any) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function() {
        // Note: Now we need to register the blob in TinyMCEs image blob
        // registry. In the next release this part hopefully won't be
        // necessary, as we are looking to handle it internally.
        const id = 'blobid' + new Date().getTime();
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
      this.editor.theme.resizeTo('100%', height);
    }
  }

  setupEditor(editor): void {
    this.editor = editor;
    editor.on('init', () => this.editorOnInit());
    editor.on('change', () => this.editorOnChange());
    editor.on('postRender', () => this.editorOnPostRender());
    editor.on('focus', () => this.editorOnFocus());
    editor.on('blur', () => this.editorOnBlur());
    editor.on('keyup', e => this.editorOnKeyup(e));
  }

  setContent(content: string): void {
    if (this.editorReady) {
      this.editor.setContent(content);
      this.editor.undoManager.clear();
    } else {
      const textArea = document.getElementById('editor') as HTMLTextAreaElement;
      if (textArea) {
        textArea.value = content;
      }
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
      this.zone(() => (this.editorReady = true));

      if (this.selectedNote) {
        this.setContent(this.selectedNote.content);
      }

      this.resizeEditor();
    }, 0);
  }

  editorOnChange(): void {
    const content = this.editor.getContent();

    if (content !== this.selectedNote.content) {
      this.selectedNote.content = content;

      this.saveNote();
    }
  }

  editorOnPostRender(): void {
    this.toggleToolbars(false);
  }

  editorOnFocus(): void {
    this.toggleToolbars(true);
  }

  editorOnBlur(): void {
    this.toggleToolbars(false);
  }

  editorOnKeyup(e: any): void {
    // if ((e.ctrlKey) && (e.keyCode === this.vKey)) {
    //   // paste from keyboard do nothing. let paste event handle it
    //   return;
    // } else if ((e.ctrlKey) && (e.keyCode === this.xKey)) {
    //   // cut from keyboard do nothing. let cut event handle it
    //   return;
    // }

    if (this.selectedNote) {
      this.editorOnChange();
    }
  }

  toggleToolbars(show: boolean) {
    Array.from(<HTMLCollectionOf<HTMLElement>>document.getElementsByClassName(
      'mce-toolbar-grp'
    )).forEach(_ => {
      if (show) {
        _.style.display = 'block';
      } else {
        _.style.display = 'none';
      }
    });

    this.toolbarVisible = show;
    this.resizeEditor();
  }

  addEditorTitle(): void {
    const editorArea = document.getElementsByClassName('mce-edit-area')[0];

    editorArea.parentElement.insertBefore(this.noteTitle.nativeElement, editorArea);
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
    if (!this.editorReady) {
      return;
    }

    const wrapperHeight = document.getElementById('app-editor').offsetHeight;
    // TODO doesn't work with angular 5
    // if (!this.titleElementHeight) {
    //   this.titleElementHeight = this.noteTitle.nativeElement.offsetHeight;
    // }
    this.titleElementHeight = document.getElementById('note-title-wrapper').offsetHeight;

    let toolbarGrpHeight = 0;
    const elements = document.getElementsByClassName('mce-toolbar-grp');
    if (elements) {
      toolbarGrpHeight = elements[0].clientHeight;
    }

    const targetHeight = wrapperHeight - toolbarGrpHeight - this.titleElementHeight;

    this.resize(targetHeight);
  }

  onAddNote(): void {
    this.addNote.next();
  }
}
