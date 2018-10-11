import {
  Component,
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  NgZone,
  HostListener
} from '@angular/core';
import { Note } from '../../core/data/model/entities/note';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BusyState } from '../../shared/busy/busy-state';

declare var tinymce: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @Output()
  addNote = new EventEmitter();
  @Output()
  changeNote = new EventEmitter<Note>();

  @ViewChild('noteTitle')
  private noteTitle: ElementRef;

  private selectedNoteValue: Note;
  @Input()
  isSaving: boolean;
  get selectedNote(): Note {
    return this.selectedNoteValue;
  }
  @Input()
  set selectedNote(value: Note) {
    if (Note.isEqual(value, this.selectedNoteValue)) {
      return;
    }

    this.selectedNoteValue = value;
    if (this.selectedNoteValue) {
      this.setContent(this.selectedNoteValue.content);

      this.titleForm.setValue({
        title: this.selectedNote.name
      });

      setTimeout(() => this.resizeEditor(), 0);
    }
  }

  busyState = BusyState.ACTIVE;
  elementId = 'editor';
  editor: any;
  editorReady = false;
  titleEditMode = false;
  titleElementHeight = 0;
  toolbarVisible = false;
  editorHeight: number;
  debouncer: Subject<(note: Note) => void> = new Subject<(note: Note) => void>();
  titleForm: FormGroup;

  constructor(private ngZone: NgZone, private fb: FormBuilder) {
    this.createTitleForm();
    this.debouncer.pipe(debounceTime(300)).subscribe(change => {
      change(this.selectedNote);
      this.changeNote.next(this.selectedNote);
    });
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

  zone(fn: (...args: any[]) => void): void {
    if (NgZone.isInAngularZone()) {
      fn();
    } else {
      this.ngZone.run(fn);
    }
  }

  saveNote(change?: (note: Note) => void): void {
    this.zone(() => {
      if (change) {
        this.debouncer.next(change);
      } else {
        this.debouncer.next(() => {});
      }
    });
  }

  initEditor(): void {
    tinymce.baseURL = 'assets/tinymce';
    tinymce.init({
      selector: '#' + this.elementId,

      relative_urls: false,
      document_base_url: '.',
      // theme_url: 'assets/tinymce/themes/modern/theme.min.js',
      skin_url: 'assets/tinymce/skins/lightgray',
      content_css: 'assets/styles/editor.css',

      statusbar: false,
      branding: false,
      menubar: false,
      resize: false,

      plugins: [
        'advlist autolink lists link image charmap hr anchor pagebreak',
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
      // TODO enable
      // extended_valid_elements : 'iframe[src|frameborder|style|scrolling|class|width|height|name|align]'
    });
  }

  // TODO
  filePickerCallback(cb): void {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    input.onchange = function(e: any) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Note: Now we need to register the blob in TinyMCEs image blob
        // registry. In the next release this part hopefully won't be
        // necessary, as we are looking to handle it internally.
        const id = 'blobid' + new Date().getTime();
        const blobCache = tinymce.activeEditor.editorUpload.blobCache;
        const base64 = (<string>reader.result).split(',')[1];
        const blobInfo = blobCache.create(id, file, base64);
        blobCache.add(blobInfo);

        // call the callback and populate the Title field with the file name
        cb(blobInfo.blobUri(), { title: file.name });
      };
    };

    input.click();
  }

  resize(height): void {
    if (this.editorReady && this.editorHeight !== height) {
      this.editor.theme.resizeTo('100%', height);
      this.editorHeight = height;
    }
  }

  setupEditor(editor): void {
    this.editor = editor;
    editor.on('init', () => this.editorOnInit());
    editor.on('change', () => this.editorOnChange());
    editor.on('postRender', () => this.editorOnPostRender());
    editor.on('focus', () => this.editorOnFocus());
    editor.on('blur', () => this.editorOnBlur());
    editor.on('keyup', e => this.editorOnKeyup());

    this.addPrintPlugin(editor);
  }

  addPrintPlugin(editor: any): void {
    editor.addCommand('mcePrint', () => {
      const win = editor.getWin();
      const body = win.document.body;

      // create title element to display in print
      const title = document.createElement('h1');
      title.classList.add('title-print');
      title.innerHTML = this.selectedNote.name;
      // insert
      body.insertBefore(title, body.firstChild);

      win.print();

      // remove
      title.remove();
    });

    editor.addButton('print', {
      title: 'Print',
      cmd: 'mcePrint'
    });

    editor.addShortcut('Meta+P', '', 'mcePrint');

    editor.addMenuItem('print', {
      text: 'Print',
      cmd: 'mcePrint',
      icon: 'print',
      shortcut: 'Meta+P',
      context: 'file'
    });
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
        this.saveNote((note: Note) => (note.name = titleValue));
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
      this.zone(() => {
        this.editorReady = true;
        this.busyState = BusyState.INACTIVE;
      });

      if (this.selectedNote) {
        this.setContent(this.selectedNote.content);
      }

      this.resizeEditor();
    }, 0);
  }

  editorOnChange(): void {
    const content = this.editor.getContent();

    if (content !== this.selectedNote.content) {
      // this.selectedNote.content = content;
      this.saveNote((note: Note) => (note.content = content));
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

  editorOnKeyup(): void {
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
    Array.from(<HTMLCollectionOf<HTMLElement>>(
      document.getElementsByClassName('mce-toolbar-grp')
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
