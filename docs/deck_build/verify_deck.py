"""Verification checks for the pitch deck build. Run standalone:
    python docs/deck_build/verify_deck.py
Each check_taskN function is appended by its corresponding plan task."""

from pptx import Presentation
from deck_helpers import get_slide_text, get_notes_text

SOURCE = 'source.pptx'
OUTPUT = '../PropWeb_Pitch_v2.pptx'


def check(condition, message):
    status = 'PASS' if condition else 'FAIL'
    print(f'[{status}] {message}')
    if not condition:
        raise AssertionError(message)


def find_slide_by_text(prs, substr):
    for i, slide in enumerate(prs.slides):
        if substr in get_slide_text(slide):
            return i, slide
    return None, None


def check_task1():
    prs = Presentation(SOURCE)
    check(len(prs.slides) == 9, 'source.pptx has 9 slides')
    i, _ = find_slide_by_text(prs, 'PROPWEB')
    check(i == 0, 'source.pptx slide 1 contains PROPWEB title')

    out = Presentation(OUTPUT)
    check(len(out.slides) == 9, 'output still has 9 slides (no new slides added yet)')


CHECKS = [check_task1]

if __name__ == '__main__':
    for fn in CHECKS:
        fn()
    print(f'\n{len(CHECKS)} check group(s) passed.')
