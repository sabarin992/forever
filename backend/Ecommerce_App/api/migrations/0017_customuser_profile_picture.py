# Generated by Django 5.1.7 on 2025-05-13 16:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_couponusage'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pics/'),
        ),
    ]
