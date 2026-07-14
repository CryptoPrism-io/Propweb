"""Rebuilds docs/PropWeb_Pitch_v2.pptx from the pristine 9-slide source,
adding the new Act 2 (+Market) slides and presenter notes per
docs/superpowers/specs/2026-07-14-pitch-deck-design.md."""

from pptx import Presentation

SOURCE = 'source.pptx'
OUTPUT = '../PropWeb_Pitch_v2.pptx'


def build():
    prs = Presentation(SOURCE)
    prs.save(OUTPUT)


if __name__ == '__main__':
    build()
