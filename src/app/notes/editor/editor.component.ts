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
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Renderer2
} from '@angular/core';
import { Note } from '../../core/data/model/entities/note';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BusyState } from '../../shared/busy/busy-state';
import { Attachment } from '../../core/data/model/entities/attachment';
import { MimeType } from './mime-type';
import { AttachmentAction, AttachmentActionType } from '../type/attachment-action';

declare var tinymce: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @Output()
  addNote = new EventEmitter();
  @Output()
  changeNote = new EventEmitter<Note>();
  @Output()
  attachmentAction = new EventEmitter<AttachmentAction>();

  @ViewChild('noteHeader')
  private noteHeader: ElementRef;
  @ViewChild('inputFile')
  private inputFile: ElementRef;

  private selectedNoteValue: Note;
  @Input()
  isSaving: boolean;

  get selectedNote(): Note {
    return this.selectedNoteValue;
  }
  @Input()
  set selectedNote(value: Note) {
    console.log('note selected');
    if (Note.isEqual(value, this.selectedNoteValue)) {
      return;
    }
    this.selectedNoteValue = value;
    this.setContent();
  }

  busyState = BusyState.ACTIVE;
  elementId = 'editor';
  editor: any;
  editorReady = false;
  titleEditMode = false;
  toolbarVisible = false;
  editorHeight: number;
  debouncer: Subject<(note: Note) => void> = new Subject<(note: Note) => void>();
  titleForm: FormGroup;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private fb: FormBuilder
  ) {
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
    tinymce.remove(this.editor);
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
        this.debouncer.next(() => { });
      }
    });
  }

  initEditor(): void {
    tinymce.baseURL = 'assets/tinymce';
    tinymce.init({
      selector: '#' + this.elementId,

      relative_urls: false,
      document_base_url: '.',
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
        'bullist numlist outdent indent | link image print attachment | table codesample | ' +
        'fullscreen code',
      image_advtab: true,
      image_title: true,
      link_context_toolbar: true,
      target_list: false,
      // enable automatic uploads of images represented by blob or data URIs
      automatic_uploads: true,
      file_picker_types: 'image',
      file_picker_callback: cb => this.filePickerCallback(cb),
      setup: ed => this.setupEditor(ed),
      custom_shortcuts: false
      // TODO enable
      // extended_valid_elements : 'iframe[src|frameborder|style|scrolling|class|width|height|name|align]'
    });
  }

  filePickerCallback(cb): void {
    const input = this.renderer.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    input.onchange = (e: any) => {
      const file = e.target.files[0];

      const reader = new FileReader();

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

      reader.readAsDataURL(file);
    };

    input.click();
  }

  setupEditor(editor): void {
    this.editor = editor;
    editor.on('init', () => this.editorOnInit());
    editor.on('change', () => this.editorOnChange());
    editor.on('postRender', () => this.editorOnPostRender());
    editor.on('focus', () => this.editorOnFocus());
    editor.on('blur', () => this.editorOnBlur());
    editor.on('keyup', () => this.editorOnKeyup());

    this.addPrintPlugin(editor);
  }

  addPrintPlugin(editor: any): void {
    editor.addCommand('mcePrint', () => {
      const win = editor.getWin();
      const body = win.document.body;

      // create title element to display in print
      const title = this.renderer.createElement('h1');
      this.renderer.addClass(title, 'title-print');

      const text = this.renderer.createText(this.selectedNote.name);
      this.renderer.appendChild(title, text);

      // insert
      this.renderer.insertBefore(body, title, body.firstChild);

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

  setContent(): void {
    if (!this.editorReady || !this.selectedNoteValue) {
      return;
    }

    this.editor.setContent(this.selectedNoteValue.content);
    this.editor.undoManager.clear();

    this.zone(() =>
      this.titleForm.setValue({
        title: this.selectedNote.name
      })
    );
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

      this.setContent();
      this.cdr.detectChanges();
    }, 0);
  }

  editorOnChange(): void {
    const content = this.editor.getContent();

    if (content !== this.selectedNote.content) {
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
      this.el.nativeElement.querySelectorAll('.mce-toolbar-grp')
    )).forEach(_ => {
      if (show) {
        _.style.display = 'block';
      } else {
        _.style.display = 'none';
      }
    });

    this.toolbarVisible = show;
  }

  addEditorTitle(): void {
    try {
      const editorArea = this.el.nativeElement.querySelector('.mce-edit-area');

      editorArea.parentElement.insertBefore(this.noteHeader.nativeElement, editorArea);
    } catch (_) {
      console.log('error add editor title element');
    }
  }

  setTitleEditMode(isEditable: boolean): void {
    this.titleEditMode = isEditable;

    if (this.titleEditMode) {
      // focus
      setTimeout(() => {
        this.noteHeader.nativeElement.getElementsByTagName('input')[0].focus();
      }, 0);
    }
  }

  onAddNote(): void {
    this.addNote.emit();
  }

  handleFileInput(files: FileList) {
    this.selectedNote.attachments.push(...Array.from(files).map(this.convertToAttachment));
    this.changeNote.next(this.selectedNote);
  }

  private convertToAttachment(file: File) {
    return new Attachment({
      name: file.name,
      type: file.type,
      size: file.size,
      data: file
    });
  }

  deleteAttachment(attachment: Attachment) {
    this.attachmentAction.emit(
      new AttachmentAction(
        { note: this.selectedNote, attachmentId: attachment.name },
        AttachmentActionType.DELETE
      )
    );
  }

  openAttachment(attachment: Attachment) {
    this.attachmentAction.emit(
      new AttachmentAction(
        { note: this.selectedNote, attachmentId: attachment.name },
        AttachmentActionType.OPEN
      )
    );
  }

  saveAttachment(attachment: Attachment) {
    this.attachmentAction.emit(
      new AttachmentAction(
        { note: this.selectedNote, attachmentId: attachment.name },
        AttachmentActionType.SAVE
      )
    );
  }

  getMimeTypeIcon(mimeType: string): string {
    return MimeType.getIconFromMimeType(mimeType);
  }
}
