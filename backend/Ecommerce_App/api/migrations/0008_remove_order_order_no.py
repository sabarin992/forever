# Generated by Django 5.1.7 on 2025-05-02 09:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_order_orderitem_orderitemreturn'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='order_no',
        ),
    ]
