package com.schlaf.steam.activities.importation;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.Resources;
import android.os.Bundle;
import android.text.Html;
import android.text.method.LinkMovementMethod;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.webkit.WebView;
import android.widget.TabHost;
import android.widget.TextView;
import android.widget.Toast;

import com.actionbarsherlock.app.SherlockFragmentActivity;
import com.actionbarsherlock.view.Menu;
import com.actionbarsherlock.view.MenuItem;
import com.schlaf.steam.R;
import com.schlaf.steam.SteamPunkRosterApplication;
import com.schlaf.steam.activities.battle.BattleActivity;
import com.schlaf.steam.activities.preferences.PreferenceActivity;
import com.schlaf.steam.activities.selectlist.PopulateArmyListActivity;
import com.schlaf.steam.activities.selectlist.SelectionModelSingleton;
import com.schlaf.steam.data.FactionNamesEnum;
import com.schlaf.steam.storage.StorageManager;
import com.schlaf.steam.xml.XmlExtractor;

public class ImportSelector extends SherlockFragmentActivity implements ImportFileListener {

    TabHost tHost;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.import_selector);
 
        
        getSupportActionBar().setTitle(R.string.import_data);
        
        tHost = (TabHost) findViewById(android.R.id.tabhost);
        tHost.setup();
 
        /** Defining Tab Change Listener event. This is invoked when tab is changed */
        TabHost.OnTabChangeListener tabChangeListener = new TabHost.OnTabChangeListener() {
 
            @Override
            public void onTabChanged(String tabId) {
                android.support.v4.app.FragmentManager fm =   getSupportFragmentManager();
                FilesToImportFragment filesToImportFragment = (FilesToImportFragment) fm.findFragmentByTag(FilesToImportFragment.ID);
                ImportedFilesFragment importedFilesFragment = (ImportedFilesFragment) fm.findFragmentByTag(ImportedFilesFragment.ID);
                android.support.v4.app.FragmentTransaction ft = fm.beginTransaction();
 
                /** Detaches the toImport fragment if exists */
                if(filesToImportFragment!=null)
                    ft.detach(filesToImportFragment);
 
                /** Detaches the imported fragment if exists */
                if(importedFilesFragment!=null)
                    ft.detach(importedFilesFragment);
 
                /** If current tab is battles */
                if(tabId.equalsIgnoreCase(FilesToImportFragment.ID)){
 
                    if(filesToImportFragment==null){
                        /** Create AndroidFragment and adding to fragmenttransaction */
                        ft.add(R.id.realtabcontent,new FilesToImportFragment(), FilesToImportFragment.ID);
                    }else{
                        /** Bring to the front, if already exists in the fragmenttransaction */
                        ft.attach(filesToImportFragment);
                        // filesToImportFragment.refresh();
                    }
 
                }else{    /** If current tab is armies */
                    if(importedFilesFragment==null){
                        /** Create AppleFragment and adding to fragmenttransaction */
                        ft.add(R.id.realtabcontent,new ImportedFilesFragment(), ImportedFilesFragment.ID);
                     }else{
                        /** Bring to the front, if already exists in the fragmenttransaction */
                        ft.attach(importedFilesFragment);
                    }
                }
                ft.commit();
            }
        };
 
        /** Setting tabchangelistener for the tab */
        tHost.setOnTabChangedListener(tabChangeListener);
 
        /** Defining tab builder for armies tab */
        TabHost.TabSpec tSpecFilesToImport = tHost.newTabSpec(FilesToImportFragment.ID);
        tSpecFilesToImport.setIndicator(getResources().getString(R.string.import_files),getResources().getDrawable(R.drawable.import_content));
        tSpecFilesToImport.setContent(new ImportTab(getBaseContext()));
        tHost.addTab(tSpecFilesToImport);
 
        /** Defining tab builder for battles tab */
        TabHost.TabSpec tSpecFilesImported = tHost.newTabSpec(ImportedFilesFragment.ID);
        tSpecFilesImported.setIndicator(getResources().getString(R.string.files_imported),getResources().getDrawable(R.drawable.edit_list_icon));
        tSpecFilesImported.setContent(new ImportTab(getBaseContext()));
        tHost.addTab(tSpecFilesImported);
 
    }
    
    
    /**
     * {@inheritDoc}
     */
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getSupportMenuInflater().inflate(R.menu.import_menu, menu);
        return true;
    }    
    
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
	    // Handle item selection
	    switch (item.getItemId()) {
	        case R.id.menu_import_help:
	    		LayoutInflater inflater = getLayoutInflater();
	        	AlertDialog.Builder alert = new AlertDialog.Builder(this);
	    		alert.setTitle("Import How-to");
	    		
	    		View versionView = inflater.inflate(R.layout.import_how_to_layout, null);
	    		
	    	    WebView wvChanges= (WebView) versionView.findViewById(R.id.wvHowTo);
	    	    
	    	    try {
	                InputStream fin = getAssets().open("how_to_import.html");
	                    byte[] buffer = new byte[fin.available()];
	                    fin.read(buffer);
	                    fin.close();
	                    wvChanges.loadData(new String(buffer), "text/html", "UTF-8");
	            } catch (IOException e) {
	                e.printStackTrace();
	            }
	    	    
	    		alert.setView(versionView);
	    		alert.show();
	            return true;
	        default:
	            return super.onOptionsItemSelected(item);
	    }
	}	    
    
  
	@Override
	public void onImportFileSelected(File file) {
		
		Toast.makeText(getApplicationContext(), "Starting import process... please wait.",
				Toast.LENGTH_SHORT).show();
		
		boolean success = true;
		InputStream is;
		try {
			is = new FileInputStream(file);
			byte[] buffer = new byte[1024];
			int length;
			StringBuffer sb = new StringBuffer();
			// copy the file content in bytes
			while ((length = is.read(buffer)) > 0) {
				String st = new String(buffer, 0, length, "UTF-8");
				sb.append(st);
			}

			is.close();

			// import
			Resources res = getResources();
			XmlExtractor extractor = new XmlExtractor(res,
					(SteamPunkRosterApplication) getApplication());
			if (extractor.extractImportedFileFromInternet(getApplication(), sb)) {
				Toast.makeText(getApplicationContext(), "import successfull",
						Toast.LENGTH_SHORT).show();

				// if successfull, copy
				String fileName = file.getName();
				StorageManager.importDataFileFromContentBuffer(
						getApplicationContext(), fileName, sb);
				
            	// notify fragment...
            	android.support.v4.app.FragmentManager fm =   getSupportFragmentManager();
            	ImportedFilesFragment fragment = (ImportedFilesFragment) fm.findFragmentByTag(ImportedFilesFragment.ID);
            	if (fragment != null) {
            		fragment.notifyFileImported(file);
            	}


			} else {
				success = false;
			}
		} catch (FileNotFoundException e) {
			success = false;
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			success = false;
			e.printStackTrace();
		} catch (IOException e) {
			success = false;
			e.printStackTrace();
		}
		if (!success) {
			Toast.makeText(getApplicationContext(),
					"import failed - make sure the source file is correct",
					Toast.LENGTH_SHORT).show();

		}

	}

	@Override
	public void onImportedFileDeleted(final File file) {
		// TODO Auto-generated method stub
   	Log.d("BattleSelector","onImportedFileDeleted " + file.getName());
    	
    	
    	// 1. Instantiate an AlertDialog.Builder with its constructor
    	AlertDialog.Builder builder = new AlertDialog.Builder(this);

    	// 2. Chain together various setter methods to set the dialog characteristics
    	builder.setMessage("you are about to delete the imported file : " + file.getName() +
    			" - the associated data will no more be available");
    	builder.setTitle("delete file?");
    	
    	builder.setPositiveButton(R.string.delete, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User clicked OK button
            	if (StorageManager.deleteImportedFile(getApplicationContext(), file)) {
                	// notify fragment...
                	android.support.v4.app.FragmentManager fm =   getSupportFragmentManager();
                	ImportedFilesFragment fragment = (ImportedFilesFragment) fm.findFragmentByTag(ImportedFilesFragment.ID);
                	fragment.notifyFileDeletion(file);
            	} else {
            		Toast.makeText(getApplicationContext(), "deletion failed", Toast.LENGTH_SHORT).show();
            	}
            	
            }
        });
    	builder.setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User cancelled the dialog
            }
        });
    	
    	// 3. Get the AlertDialog from create()
    	AlertDialog dialog = builder.create();
    	
    	dialog.show();
	}


	@Override
	public void onImportFileDeleted(final File file) {
 	Log.d("BattleSelector","onImportFileDeleted " + file.getName());
    	
    	
    	// 1. Instantiate an AlertDialog.Builder with its constructor
    	AlertDialog.Builder builder = new AlertDialog.Builder(this);

    	// 2. Chain together various setter methods to set the dialog characteristics
    	builder.setMessage("you are about to delete the file : " + file.getName());
    	builder.setTitle("delete file?");
    	
    	builder.setPositiveButton(R.string.delete, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User clicked OK button
            	if (StorageManager.deleteImportedFile(getApplicationContext(), file)) {
                	// notify fragment...
                	android.support.v4.app.FragmentManager fm =   getSupportFragmentManager();
                	FilesToImportFragment fragment = (FilesToImportFragment) fm.findFragmentByTag(FilesToImportFragment.ID);
                	if (fragment != null) {
                		fragment.notifyFileDeletion(file);
                	}
            	} else {
            		Toast.makeText(getApplicationContext(), "deletion failed", Toast.LENGTH_SHORT).show();
            	}
            	
            }
        });
    	builder.setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User cancelled the dialog
            }
        });
    	
    	// 3. Get the AlertDialog from create()
    	AlertDialog dialog = builder.create();
    	
    	dialog.show();		
	}
}
