#coding=utf-8
import os
import shutil
from pdf_watermark import *

TMP_PATH = 'static/tmp/'
def create_tmp_watermark_file(user, input_file, output_path, output_filename):
    if not os.path.exists(output_path):
        #shutil.rmtree(output_path)
        os.mkdir(output_path)
    watermark_path = output_path  + '/' + 'mark.pdf'
    create_watermark(watermark_path,  u"敬呈 " + user + u" 审阅，请勿外传")
    add_watermark(input_file, watermark_path, output_path + '/' + output_filename)
