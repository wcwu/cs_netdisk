#coding=utf-8
import os
import shutil
from pdf_watermark import *
import logging

TMP_PATH = 'static/tmp/'
logger = logging.getLogger("watermark")
def create_tmp_watermark_file(user, input_file, output_path, output_filename):
    if not os.path.exists(output_path):
        #shutil.rmtree(output_path)
        os.mkdir(output_path)
    watermark_path = output_path  + '/' + 'mark.pdf'
    input_f = PdfFileReader(open(input_file, 'rb'))
    w_h = (input_f.getPage(0).mediaBox[2],input_f.getPage(0).mediaBox[3])
    logger.info(w_h)
    create_watermark(watermark_path,  u"敬呈 " + user + u" 审阅，请勿外传", w_h)
    add_watermark(input_file, watermark_path, output_path + '/' + output_filename)
