import { Node, mergeAttributes } from '@tiptap/core';

export const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: 'true', class: 'w-full rounded-xl border border-[var(--color-border)] shadow-lg my-6 aspect-video bg-black/10' })];
  },
});

export const AudioNode = Node.create({
  name: 'audio',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(HTMLAttributes, { controls: 'true', class: 'w-full my-6 rounded-full' })];
  },
});

export const IframeNode = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: 'Sembot Document',
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      { class: 'w-full my-6 aspect-[1/1.4] md:aspect-[1/1.2] lg:aspect-[1/1] overflow-hidden rounded-xl border border-[var(--color-border)] shadow-xl relative' },
      ['iframe', mergeAttributes(HTMLAttributes, { class: 'w-full h-full border-none absolute inset-0' })]
    ];
  },
});
