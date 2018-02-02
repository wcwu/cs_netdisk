#coding=utf-8
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from PyPDF2 import PdfFileWriter, PdfFileReader
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

def create_watermark(file_path, content):
    #默认大小为21cm*29.7cm
    #c = canvas.Canvas(file_path, pagesize = (30*cm, 30*cm))
    c = canvas.Canvas(file_path)
    #移动坐标原点(坐标系左下为(0,0))
    c.translate(12*cm, 12*cm)
                                                                                                                                
    pdfmetrics.registerFont(TTFont('simsun', 'simsun.ttf'))
    #设置字体
    c.setFont("simsun", 20)
    #指定描边的颜色
    c.setStrokeColorRGB(0, 1, 0)
    #指定填充颜色
    #c.setFillColorRGB(0, 1, 0)
    #画一个矩形
    #c.rect(cm, cm, 7*cm, 17*cm, fill=1)
                                                                                                                                
    #旋转45度，坐标系被旋转
    c.rotate(30)
    #指定填充颜色
    #c.setFillColorRGB(0.6, 0, 0)
    #设置透明度，1为不透明
    #c.setFillAlpha(1)
    #画几个文本，注意坐标系旋转的影响
    c.setFillAlpha(0.3)
    c.drawCentredString(0, 0, content)
    #c.drawString(3*cm, 0*cm, content)
    #c.setFillAlpha(0.3)
    #c.drawString(9*cm, 6*cm, content)
                                                                                                                                
    #关闭并保存pdf文件
    c.save()
#create_watermark('walker')

def add_watermark(pdf_file_in, pdf_file_mark, pdf_file_out):
    pdf_output = PdfFileWriter()
    input_stream = file(pdf_file_in, 'rb')
    pdf_input = PdfFileReader(input_stream, strict=False)
                                                                                
    # PDF文件被加密了
    #if pdf_input.getIsEncrypted():
    #    print '该PDF文件被加密了.'
    #    # 尝试用空密码解密
    #    try:
    #        pdf_input.decrypt('')
    #    except Exception, e:
    #        print '尝试用空密码解密失败.'
    #        return False
    #    else:
    #        print '用空密码解密成功.'
    ## 获取PDF文件的页数
    pageNum = pdf_input.getNumPages()
    #读入水印pdf文件
    pdf_watermark = PdfFileReader(file(pdf_file_mark, 'rb'), strict=False)
    # 给每一页打水印
    for i in range(pageNum):
        page = pdf_input.getPage(i)
        page.mergePage(pdf_watermark.getPage(0))
        page.compressContentStreams()   #压缩内容
        pdf_output.addPage(page)
    pdf_output.write(open(pdf_file_out, 'wb'))

